use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("{0}")]
    Message(String),
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Serialization error: {0}")]
    Serde(#[from] serde_json::Error),
    #[error("Password hash error: {0}")]
    PasswordHash(#[from] argon2::password_hash::Error),
    #[error("Key derivation error: {0}")]
    Argon2(#[from] argon2::Error),
    #[error("Base64 decode error: {0}")]
    Base64(#[from] base64::DecodeError),
    #[error("Walkdir error: {0}")]
    Walkdir(#[from] walkdir::Error),
    #[error("Configuration not initialized.")]
    NotInitialized,
    #[error("Secure vault is not mounted in memory.")]
    SessionLocked,
    #[error("Secure vault unavailable or corrupted.")]
    VaultUnavailable,
}

impl AppError {
    pub fn context(context: &str, message: impl Into<String>) -> Self {
        Self::Message(format!("[{}] {}", context, message.into()))
    }
}

impl From<aes_gcm::Error> for AppError {
    fn from(_: aes_gcm::Error) -> Self {
        AppError::context("crypto", "AES-GCM operation failed.")
    }
}

impl<T> From<std::sync::PoisonError<T>> for AppError {
    fn from(_: std::sync::PoisonError<T>) -> Self {
        AppError::context("state", "Runtime mutex is poisoned.")
    }
}
