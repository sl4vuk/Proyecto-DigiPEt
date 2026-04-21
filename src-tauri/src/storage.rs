use std::{
    fs,
    path::{Path, PathBuf},
};

use chrono::Utc;
use directories::ProjectDirs;
use serde::Serialize;

use crate::{
    error::AppError,
    models::{EncryptedVaultBlob, SecureState, SecurityEvent},
};

#[derive(Debug, Clone)]
pub struct StoragePaths {
    pub base_dir: PathBuf,
    pub state_file: PathBuf,
    pub vault_file: PathBuf,
    pub exports_dir: PathBuf,
}

impl StoragePaths {
    pub fn new() -> Result<Self, AppError> {
        let project = ProjectDirs::from("com", "AegisVault", "AegisVault").ok_or_else(|| {
            AppError::context("storage::new", "No se pudo resolver el directorio de la aplicación.")
        })?;

        let base_dir = project.data_local_dir().to_path_buf();
        let state_file = base_dir.join("state.json");
        let vault_file = base_dir.join("vault.secure.json");
        let exports_dir = base_dir.join("exports");

        Ok(Self {
            base_dir,
            state_file,
            vault_file,
            exports_dir,
        })
    }
}

pub fn ensure_layout(paths: &StoragePaths) -> Result<(), AppError> {
    fs::create_dir_all(&paths.base_dir)?;
    fs::create_dir_all(&paths.exports_dir)?;
    Ok(())
}

pub fn read_or_create_secure_state(paths: &StoragePaths) -> Result<SecureState, AppError> {
    if !paths.state_file.exists() {
        let state = SecureState::default();
        write_secure_state(paths, &state)?;
        return Ok(state);
    }

    let content = fs::read(&paths.state_file)?;
    Ok(serde_json::from_slice(&content)?)
}

pub fn write_secure_state(paths: &StoragePaths, state: &SecureState) -> Result<(), AppError> {
    atomic_json_write(&paths.state_file, state)
}

pub fn read_vault_blob(paths: &StoragePaths) -> Result<EncryptedVaultBlob, AppError> {
    if !paths.vault_file.exists() {
        return Err(AppError::VaultUnavailable);
    }

    let content = fs::read(&paths.vault_file)?;
    Ok(serde_json::from_slice(&content)?)
}

pub fn write_vault_blob(paths: &StoragePaths, blob: &EncryptedVaultBlob) -> Result<(), AppError> {
    atomic_json_write(&paths.vault_file, blob)
}

pub fn export_events(
    paths: &StoragePaths,
    events: &[SecurityEvent],
    destination: Option<PathBuf>,
) -> Result<PathBuf, AppError> {
    let target = destination.unwrap_or_else(|| {
        paths.exports_dir.join(format!(
            "aegis-vault-security-events-{}.json",
            Utc::now().format("%Y%m%d-%H%M%S")
        ))
    });

    if let Some(parent) = target.parent() {
        fs::create_dir_all(parent)?;
    }

    atomic_json_write(&target, &events)?;
    Ok(target)
}

fn atomic_json_write<T: Serialize>(path: &Path, value: &T) -> Result<(), AppError> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    let temp_path = path.with_extension("tmp");
    let payload = serde_json::to_vec_pretty(value)?;

    fs::write(&temp_path, payload)?;
    if path.exists() {
        fs::remove_file(path)?;
    }
    fs::rename(&temp_path, path)?;

    Ok(())
}
