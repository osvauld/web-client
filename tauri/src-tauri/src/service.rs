use crate::database::models::{
    CredentialWithEncryptedKey, Folder, FolderAccessWithPublicKey, SyncRecord,
};
use crate::database::queries;
use crate::handler::CRYPTO_UTILS;
use crate::types::{CryptoResponse, FolderResponse};
use crate::DbConnection;
use chrono::{DateTime, Utc};
use crypto_utils::types::UserAccess;
use crypto_utils::CryptoUtils;
use log::{error, info};
use tauri::State;
use tauri::Wry;
use tauri_plugin_store::Store;
use uuid::Uuid;

fn get_current_timestamp() -> String {
    Utc::now().format("%Y-%m-%d %H:%M:%S%.3f").to_string()
}
use crypto_utils::types::UserPublicKey;
pub async fn is_signed_up(store: &Store<Wry>) -> Result<bool, String> {
    Ok(store.get("certificate").is_some())
}

pub async fn save_passphrase(
    username: &str,
    passphrase: &str,
    challenge: &str,
    store: &Store<Wry>,
    db_connection: State<'_, DbConnection>,
) -> Result<CryptoResponse, String> {
    let key_pair = {
        let crypto = CRYPTO_UTILS.lock().await;
        crypto
            .generate_keys(passphrase, username)
            .map_err(|e| e.to_string())?
    };

    {
        let mut crypto = CRYPTO_UTILS.lock().await;
        crypto
            .decrypt_and_load_certificate(&key_pair.private_key, &key_pair.salt, passphrase)
            .map_err(|e| e.to_string())?;
    }

    let signature = {
        let crypto = CRYPTO_UTILS.lock().await;
        crypto.sign_message(challenge).map_err(|e| e.to_string())?
    };
    let user_id = add_user(
        db_connection,
        username.to_string(),
        key_pair.public_key.clone(),
    )
    .await?;
    store.set("certificate", key_pair.private_key);
    store.set("salt", key_pair.salt);
    store.set("user_id", user_id);
    store.save().map_err(|e| e.to_string())?;

    Ok(CryptoResponse::SavePassphrase {
        signature: signature,
        username: username.to_string(),
        deviceKey: key_pair.public_key.clone(),
        encryptionKey: key_pair.public_key.clone(),
    })
}

pub async fn get_public_key(
    passphrase: &str,
    store: &Store<Wry>,
) -> Result<CryptoResponse, String> {
    let certificate = store
        .get("certificate")
        .and_then(|v| v.as_str().map(String::from))
        .ok_or_else(|| "Certificate not found in storage".to_string())?;

    let salt = store
        .get("salt")
        .and_then(|v| v.as_str().map(String::from))
        .ok_or_else(|| "Salt not found in storage".to_string())?;

    // Create a new CryptoUtils instance and decrypt the certificate

    let mut crypto = CryptoUtils::new();
    // TODO: change unwrap to proper error handling
    crypto
        .decrypt_and_load_certificate(&certificate, &salt, passphrase)
        .map_err(|e| format!("Failed to decrypt and load certificate: {}", e))?;
    {
        let mut crypto_utils = CRYPTO_UTILS.lock().await;
        *crypto_utils = crypto;
    }
    // Get the public key

    let public_key = {
        let crypto = CRYPTO_UTILS.lock().await;
        crypto
            .get_public_key()
            .map_err(|e| format!("Failed to get public key: {}", e))?
    };
    Ok(CryptoResponse::PublicKey(public_key))
}

pub fn sign_hashed_message(crypto: &mut CryptoUtils, message: &str) -> Result<String, String> {
    crypto
        .sign_and_hash_message(message)
        .map_err(|e| format!("Failed to hash and sign message: {}", e))
}

pub fn store_certificate_and_salt(
    store: &Store<Wry>,
    certificate: &str,
    salt: &str,
) -> Result<(), String> {
    store.set("certificate", certificate);
    store.set("salt", salt);
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

pub fn get_certificate_and_salt(store: &Store<Wry>) -> Result<(String, String), String> {
    let certificate = store
        .get("certificate")
        .and_then(|v| v.as_str().map(String::from))
        .ok_or_else(|| "Certificate not found in store".to_string())?;

    let salt = store
        .get("salt")
        .and_then(|v| v.as_str().map(String::from))
        .ok_or_else(|| "Salt not found in store".to_string())?;

    Ok((certificate, salt))
}

pub async fn add_folder(
    name: &str,
    description: &str,
    db_connection: State<'_, DbConnection>,
) -> Result<Folder, String> {
    info!("Adding folder: {}", name);
    let folder_id = Uuid::new_v4().to_string();
    // Create folder object

    let folder = Folder {
        id: folder_id.clone(),
        name: name.to_string(),
        description: Some(description.to_string()),
        shared: true,
        access_type: "private".to_string(),
        created_at: get_current_timestamp(),
        updated_at: get_current_timestamp(),
    };

    let current_device_id = 1.to_string();

    // Create sync records for each target device
    let sync_records: Vec<SyncRecord> = ["1", "2"]
        .iter()
        .map(|target_id| SyncRecord {
            id: Uuid::new_v4().to_string(),
            resource_id: folder_id.clone(),
            resource_type: "folder".to_string(),
            operation_type: "create".to_string(),
            source_device_id: current_device_id.clone(),
            target_device_id: target_id.to_string(),
            status: "pending".to_string(),
            folder_id: Some(folder_id.clone()),
            credential_id: None,
            created_at: get_current_timestamp(),
            updated_at: get_current_timestamp(),
        })
        .collect();

    // Execute transaction
    let mut conn = db_connection.lock().await;
    let _ = queries::insert_folder_with_sync(&mut *conn, &folder, &sync_records).await;

    Ok(folder)
}

pub async fn get_all_folders(
    db_connection: State<'_, DbConnection>,
) -> Result<Vec<FolderResponse>, String> {
    let folders = queries::get_all_folders(&db_connection)
        .await
        .map_err(|e| format!("Failed to fetch folders: {}", e))?;

    let response: Vec<FolderResponse> = folders
        .into_iter()
        .map(|folder| FolderResponse {
            id: folder.id,
            name: folder.name,
            description: folder.description.unwrap_or_default(),
            shared: folder.shared,
            access_type: folder.access_type,
        })
        .collect();

    Ok(response)
}

pub async fn add_user(
    db_connection: State<'_, DbConnection>,
    username: String,
    public_key: String,
) -> Result<String, String> {
    let user_id = queries::add_user(&db_connection, username, public_key)
        .await
        .map_err(|e| format!("Failed to add user: {}", e))?;
    Ok(user_id)
}

pub async fn add_credential_service(
    db_connection: &State<'_, DbConnection>,
    encrypted_payload: String,
    folder_id: String,
) -> Result<(), String> {
    queries::add_credential_and_access(&db_connection, encrypted_payload, folder_id)
        .await
        .map_err(|e| format!("Failed to add credential and access: {}", e))
}

pub async fn get_credentials_for_folder(
    db_connection: &State<'_, DbConnection>,
    folder_id: String,
    store: &Store<Wry>,
) -> Result<Vec<CredentialWithEncryptedKey>, String> {
    let user_id = store
        .get("user_id")
        .and_then(|v| v.as_str().map(String::from))
        .ok_or_else(|| "user not found in store".to_string())?;

    queries::get_credentials_with_encrypted_key(&db_connection, folder_id)
        .await
        .map_err(|e| format!("Failed to get credentials with encrypted key: {}", e))
}
