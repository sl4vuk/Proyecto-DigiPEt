use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use argon2::{
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use base64::{engine::general_purpose::STANDARD_NO_PAD as B64, Engine};
use rand::{rngs::OsRng, RngCore};

use crate::{
    error::AppError,
    models::{EncryptedVaultBlob, VaultData},
};

pub fn validate_pin_strength(pin: &str) -> Result<(), AppError> {
    if pin.trim().len() < 6 {
        return Err(AppError::context(
            "security::validate_pin_strength",
            "El PIN debe tener al menos 6 caracteres.",
        ));
    }

    if pin.chars().all(|character| character.is_ascii_digit()) && pin.len() < 8 {
        return Err(AppError::context(
            "security::validate_pin_strength",
            "Los PIN numéricos deben tener al menos 8 dígitos.",
        ));
    }

    Ok(())
}

pub fn hash_pin(pin: &str) -> Result<String, AppError> {
    let salt = SaltString::generate(&mut argon2::password_hash::rand_core::OsRng);
    Ok(Argon2::default()
        .hash_password(pin.as_bytes(), &salt)?
        .to_string())
}

pub fn verify_pin(pin: &str, hash: &str) -> Result<bool, AppError> {
    let parsed = PasswordHash::new(hash)?;
    Ok(Argon2::default()
        .verify_password(pin.as_bytes(), &parsed)
        .is_ok())
}

pub fn generate_encryption_salt() -> String {
    let mut salt = [0_u8; 16];
    OsRng.fill_bytes(&mut salt);
    B64.encode(salt)
}

pub fn derive_key(pin: &str, salt_b64: &str) -> Result<Vec<u8>, AppError> {
    let salt = B64.decode(salt_b64)?;
    let mut key = vec![0_u8; 32];
    Argon2::default().hash_password_into(pin.as_bytes(), &salt, &mut key)?;
    Ok(key)
}

pub fn encrypt_vault(vault: &VaultData, key: &[u8]) -> Result<EncryptedVaultBlob, AppError> {
    let plaintext = serde_json::to_vec_pretty(vault)?;
    encrypt_bytes(&plaintext, key)
}

pub fn decrypt_vault(blob: &EncryptedVaultBlob, key: &[u8]) -> Result<VaultData, AppError> {
    let plaintext = decrypt_bytes(blob, key)?;
    Ok(serde_json::from_slice(&plaintext)?)
}

fn encrypt_bytes(plaintext: &[u8], key: &[u8]) -> Result<EncryptedVaultBlob, AppError> {
    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|_| AppError::context("security::encrypt_bytes", "La clave de cifrado no es válida."))?;

    let mut nonce = [0_u8; 12];
    OsRng.fill_bytes(&mut nonce);

    let ciphertext = cipher.encrypt(Nonce::from_slice(&nonce), plaintext)?;
    Ok(EncryptedVaultBlob {
        version: 1,
        nonce: B64.encode(nonce),
        ciphertext: B64.encode(ciphertext),
    })
}

fn decrypt_bytes(blob: &EncryptedVaultBlob, key: &[u8]) -> Result<Vec<u8>, AppError> {
    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|_| AppError::context("security::decrypt_bytes", "La clave de cifrado no es válida."))?;
    let nonce = B64.decode(&blob.nonce)?;
    let ciphertext = B64.decode(&blob.ciphertext)?;

    Ok(cipher.decrypt(Nonce::from_slice(&nonce), ciphertext.as_ref())?)
}
