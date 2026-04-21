use std::{
    fs::{self, File},
    io::{BufReader, Read},
    path::{Path, PathBuf},
};

use chrono::{DateTime, Utc};
use sha2::{Digest, Sha256};
use walkdir::WalkDir;

use crate::{
    error::AppError,
    models::{IntegrityStatus, ProtectedItem, ProtectedItemKind, ProtectionLevel},
};

pub fn normalize_existing_path(path: &str) -> Result<PathBuf, AppError> {
    let resolved = PathBuf::from(path);
    if !resolved.exists() {
        return Err(AppError::context(
            "integrity::normalize_existing_path",
            format!("La ruta no existe: {}", path),
        ));
    }

    Ok(resolved.canonicalize()?)
}

pub fn detect_kind(path: &Path) -> Result<ProtectedItemKind, AppError> {
    if path.is_file() {
        return Ok(ProtectedItemKind::File);
    }

    if path.is_dir() {
        return Ok(ProtectedItemKind::Directory);
    }

    Err(AppError::context(
        "integrity::detect_kind",
        format!("La ruta no es un archivo ni una carpeta válida: {}", path.display()),
    ))
}

pub fn create_item(
    path: &str,
    requested_kind: ProtectedItemKind,
    protection_level: ProtectionLevel,
    note: Option<String>,
) -> Result<ProtectedItem, AppError> {
    let resolved = normalize_existing_path(path)?;
    let actual_kind = detect_kind(&resolved)?;

    if actual_kind != requested_kind {
        return Err(AppError::context(
            "integrity::create_item",
            format!(
                "El tipo solicitado ({:?}) no coincide con la ruta real ({:?}).",
                requested_kind, actual_kind
            ),
        ));
    }

    let size_bytes = collect_size(&resolved, actual_kind)?;
    let fingerprint = compute_fingerprint(&resolved, actual_kind)?;
    let now = Utc::now();
    let last_accessed_at = fs::metadata(&resolved)
        .ok()
        .and_then(|metadata| metadata.accessed().ok())
        .map(DateTime::<Utc>::from);

    Ok(ProtectedItem {
        id: uuid::Uuid::new_v4().to_string(),
        path: resolved.to_string_lossy().to_string(),
        kind: actual_kind,
        size_bytes,
        locked: true,
        protection_level,
        created_at: now,
        updated_at: now,
        last_accessed_at,
        fingerprint,
        integrity_status: IntegrityStatus::Verified,
        notes: note.filter(|value| !value.trim().is_empty()),
    })
}

pub fn refresh_item(item: &mut ProtectedItem) -> Result<IntegrityStatus, AppError> {
    let path = PathBuf::from(&item.path);
    item.updated_at = Utc::now();

    if !path.exists() {
        item.integrity_status = IntegrityStatus::Missing;
        return Ok(item.integrity_status);
    }

    item.size_bytes = collect_size(&path, item.kind)?;
    item.last_accessed_at = fs::metadata(&path)
        .ok()
        .and_then(|metadata| metadata.accessed().ok())
        .map(DateTime::<Utc>::from);

    let current = compute_fingerprint(&path, item.kind)?;
    item.integrity_status = if current == item.fingerprint {
        IntegrityStatus::Verified
    } else {
        IntegrityStatus::Changed
    };

    Ok(item.integrity_status)
}

pub fn apply_lock_state(path: &str, kind: ProtectedItemKind, locked: bool) -> Result<(), AppError> {
    let resolved = PathBuf::from(path);
    if !resolved.exists() {
        return Ok(());
    }

    match kind {
        ProtectedItemKind::File => set_readonly(&resolved, locked)?,
        ProtectedItemKind::Directory => {
            for entry in WalkDir::new(&resolved) {
                let entry = entry?;
                if entry.path().is_file() {
                    set_readonly(entry.path(), locked)?;
                }
            }
            let _ = set_readonly(&resolved, locked);
        }
    }

    Ok(())
}

fn set_readonly(path: &Path, readonly: bool) -> Result<(), AppError> {
    let mut permissions = fs::metadata(path)?.permissions();
    permissions.set_readonly(readonly);
    fs::set_permissions(path, permissions)?;
    Ok(())
}

fn collect_size(path: &Path, kind: ProtectedItemKind) -> Result<u64, AppError> {
    match kind {
        ProtectedItemKind::File => Ok(fs::metadata(path)?.len()),
        ProtectedItemKind::Directory => {
            let mut total = 0_u64;
            for entry in WalkDir::new(path) {
                let entry = entry?;
                if entry.path().is_file() {
                    total = total.saturating_add(entry.metadata()?.len());
                }
            }
            Ok(total)
        }
    }
}

fn compute_fingerprint(path: &Path, kind: ProtectedItemKind) -> Result<String, AppError> {
    let mut hasher = Sha256::new();

    match kind {
        ProtectedItemKind::File => hash_file(path, &mut hasher)?,
        ProtectedItemKind::Directory => hash_directory(path, &mut hasher)?,
    }

    Ok(format!("{:x}", hasher.finalize()))
}

fn hash_file(path: &Path, hasher: &mut Sha256) -> Result<(), AppError> {
    hasher.update(path.to_string_lossy().as_bytes());
    let metadata = fs::metadata(path)?;
    hasher.update(metadata.len().to_le_bytes());
    if let Ok(modified) = metadata.modified() {
        hasher.update(format!("{:?}", modified).as_bytes());
    }

    let file = File::open(path)?;
    let mut reader = BufReader::new(file);
    let mut buffer = [0_u8; 16 * 1024];

    loop {
        let bytes_read = reader.read(&mut buffer)?;
        if bytes_read == 0 {
            break;
        }

        hasher.update(&buffer[..bytes_read]);
    }

    Ok(())
}

fn hash_directory(path: &Path, hasher: &mut Sha256) -> Result<(), AppError> {
    for entry in WalkDir::new(path).sort_by_file_name() {
        let entry = entry?;
        let entry_path = entry.path();
        let relative = entry_path.strip_prefix(path).unwrap_or(entry_path);

        hasher.update(relative.to_string_lossy().as_bytes());

        if entry_path.is_file() {
            let metadata = entry.metadata()?;
            hasher.update(metadata.len().to_le_bytes());
            if let Ok(modified) = metadata.modified() {
                hasher.update(format!("{:?}", modified).as_bytes());
            }
        }
    }

    Ok(())
}
