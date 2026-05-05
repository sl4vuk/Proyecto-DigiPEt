use hostname::get as get_hostname_os;
use local_ip_address::local_ip;
use mac_address::get_mac_address;
use sysinfo::System;

use crate::models::SystemInfoPayload;

fn build_system() -> System {
    let mut system = System::new_all();
    system.refresh_all();
    system
}

pub fn get_system_info() -> Result<SystemInfoPayload, String> {
    let system = build_system();
    let hostname = get_hostname_os()
        .map(|value| value.to_string_lossy().to_string())
        .unwrap_or_else(|_| "No disponible".to_string());
    let username = whoami::username();
    let os_name = System::name().unwrap_or_else(|| "No disponible".to_string());
    let os_version = System::os_version().unwrap_or_else(|| "No disponible".to_string());
    let local_ip = local_ip().ok().map(|ip| ip.to_string());
    let device_name = format!("{} {}", whoami::platform(), whoami::devicename());

    let mut mac_addresses = Vec::new();
    if let Ok(Some(address)) = get_mac_address() {
        mac_addresses.push(address.to_string());
    }
    if mac_addresses.is_empty() {
        mac_addresses.push("No disponible".to_string());
    }

    let payload = SystemInfoPayload {
        hostname,
        username,
        os_name,
        os_version,
        device_name,
        local_ip,
        mac_addresses,
        location: None,
    };

    let _ = system;
    Ok(payload)
}

pub fn get_network_info() -> Result<SystemInfoPayload, String> {
    get_system_info()
}

pub fn get_current_user() -> Result<String, String> {
    Ok(whoami::username())
}

pub fn get_hostname() -> Result<String, String> {
    Ok(get_hostname_os()
        .map(|value| value.to_string_lossy().to_string())
        .unwrap_or_else(|_| "No disponible".to_string()))
}

pub fn get_os_info() -> Result<String, String> {
    let name = System::name().unwrap_or_else(|| "No disponible".to_string());
    let version = System::os_version().unwrap_or_else(|| "No disponible".to_string());
    Ok(format!("{} {}", name, version).trim().to_string())
}

pub fn get_local_ip() -> Result<String, String> {
    Ok(local_ip()
        .map(|ip| ip.to_string())
        .unwrap_or_else(|_| "No disponible".to_string()))
}

pub fn get_mac_addresses() -> Result<Vec<String>, String> {
    let mut macs = Vec::new();
    if let Ok(Some(address)) = get_mac_address() {
        macs.push(address.to_string());
    }
    if macs.is_empty() {
        macs.push("No disponible".to_string());
    }
    Ok(macs)
}
