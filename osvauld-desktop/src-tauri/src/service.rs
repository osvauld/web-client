use crate::types::CryptoResponse;
use crypto_utils::types::Credential;
use crypto_utils::CryptoUtils;
use std::path::PathBuf;
use tauri::State;
use tauri::{AppHandle, Wry};
use tauri_plugin_store::StoreCollection;

pub fn is_signed_up(
    app_handle: &AppHandle,
    stores: State<'_, StoreCollection<Wry>>,
) -> Result<bool, String> {
    let path = PathBuf::from("my_app_store.bin");
    tauri_plugin_store::with_store(app_handle.clone(), stores, path, |store| {
        let is_signed = store.get("certificate").is_some();
        println!("Is signed up: {}", is_signed); // Debug print
        Ok(is_signed)
    })
    .map_err(|e| e.to_string())
}

pub fn save_passphrase(
    crypto: &mut CryptoUtils,
    username: &str,
    passphrase: &str,
    challenge: &str,
    app_handle: &AppHandle,
    stores: State<'_, StoreCollection<Wry>>,
) -> Result<CryptoResponse, String> {
    let key_pair = crypto
        .generate_keys(passphrase, username)
        .map_err(|e| e.to_string())?;

    let path = PathBuf::from("my_app_store.bin");
    tauri_plugin_store::with_store(app_handle.clone(), stores, path, |store| {
        store.insert(
            "certificate".to_string(),
            key_pair.private_key.clone().into(),
        )?;
        store.insert("salt".to_string(), key_pair.salt.clone().into())?;
        store.save()
    })
    .map_err(|e| e.to_string())?;

    crypto
        .decrypt_and_load_certificate(&key_pair.private_key, &key_pair.salt, passphrase)
        .map_err(|e| e.to_string())?;

    let signature = crypto.sign_message(challenge).map_err(|e| e.to_string())?;
    Ok(CryptoResponse::SavePassphrase {
        signature: signature,
        username: username.to_string(),
        deviceKey: key_pair.public_key.clone(),
        encryptionKey: key_pair.public_key.clone(),
    })
}

pub fn get_public_key(
    passphrase: &str,
    app_handle: &AppHandle,
    stores: State<'_, StoreCollection<Wry>>,
) -> Result<(String, CryptoUtils), String> {
    let path = PathBuf::from("my_app_store.bin");

    // Retrieve certificate and salt from storage
    let (certificate, salt) =
        tauri_plugin_store::with_store(app_handle.clone(), stores, path, |store| {
            let certificate = store
                .get("certificate")
                .and_then(|v| v.as_str().map(String::from))
                .ok_or_else(|| "Failed to retrieve certificate from storage".to_string());
            let salt = store
                .get("salt")
                .and_then(|v| v.as_str().map(String::from))
                .ok_or_else(|| "Failed to retrieve salt from storage".to_string());
            Ok((certificate, salt))
        })
        .map_err(|e| e.to_string())?;

    // Create a new CryptoUtils instance and decrypt the certificate
    let mut crypto_utils = CryptoUtils::new();
    // TODO: change unwrap to proper error handling
    crypto_utils
        .decrypt_and_load_certificate(&certificate.unwrap(), &salt.unwrap(), passphrase)
        .map_err(|e| format!("Failed to decrypt and load certificate: {}", e))?;

    // Get the public key
    let public_key = crypto_utils
        .get_public_key()
        .map_err(|e| format!("Failed to get public key: {}", e))?;

    Ok((public_key, crypto_utils))
}

pub fn sign_hashed_message(crypto: &mut CryptoUtils, message: &str) -> Result<String, String> {
    crypto
        .sign_and_hash_message(message)
        .map_err(|e| format!("Failed to hash and sign message: {}", e))
}

pub fn decrypt_credentials(
    crypto: &mut CryptoUtils,
    credentials: Vec<Credential>,
) -> Result<Vec<Credential>, String> {
    crypto
        .decrypt_credentials(credentials)
        .map_err(|e| format!("Failed to decrypt credentials: {}", e))
}
