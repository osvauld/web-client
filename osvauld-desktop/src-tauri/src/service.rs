use crate::database::models::FolderAccessWithPublicKey;
use crate::database::queries;
use crate::handler::CRYPTO_UTILS;
use crate::types::{CryptoResponse, FolderResponse};
use crate::DbConnection;
use crypto_utils::CryptoUtils;
use log::{error, info};
use tauri::State;
use tauri::Wry;
use tauri_plugin_store::Store;
use uuid::Uuid;

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
        let crypto = CRYPTO_UTILS.lock().map_err(|e| e.to_string())?;
        crypto
            .generate_keys(passphrase, username)
            .map_err(|e| e.to_string())?
    };

    {
        let mut crypto = CRYPTO_UTILS.lock().map_err(|e| e.to_string())?;
        crypto
            .decrypt_and_load_certificate(&key_pair.private_key, &key_pair.salt, passphrase)
            .map_err(|e| e.to_string())?;
    }

    let signature = {
        let crypto = CRYPTO_UTILS.lock().map_err(|e| e.to_string())?;
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
        let mut crypto_utils = CRYPTO_UTILS.lock().map_err(|e| e.to_string())?;
        *crypto_utils = crypto;
    }
    // Get the public key

    let public_key = {
        let crypto = CRYPTO_UTILS.lock().map_err(|e| e.to_string())?;
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

// pub fn decrypt_credentials(
//     crypto: &mut CryptoUtils,
//     credentials: Vec<Credential>,
// ) -> Result<Vec<Credential>, String> {
//     crypto
//         .decrypt_credentials(credentials)
//         .map_err(|e| format!("Failed to decrypt credentials: {}", e))
// }

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
    store: &Store<Wry>,
    db_connection: State<'_, DbConnection>,
) -> Result<(), String> {
    let user_id = store
        .get("user_id")
        .and_then(|v| v.as_str().map(String::from))
        .ok_or_else(|| "user not found in store".to_string())?;

    let folder = queries::add_folder(
        &db_connection,
        name.to_string(),
        Some(description.to_string()),
        true,
        "manager".to_string(),
    )
    .await
    .map_err(|e| format!("Failed to add folder: {}", e))?;

    queries::add_folder_access(&db_connection, folder.id, user_id, "manager".to_string())
        .await
        .map_err(|e| format!("Failed to add folder access: {}", e))?;

    Ok(())
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

pub async fn get_folder_access(
    db_connection: State<'_, DbConnection>,
    folder_id: &str,
) -> Result<Vec<UserPublicKey>, String> {
    // Get folder access information
    let folder_access = queries::get_folder_access(&db_connection, folder_id.to_string())
        .await
        .map_err(|e| format!("Failed to get folder access: {}", e))
        .unwrap();

    Ok(folder_access
        .into_iter()
        .map(|fa| UserPublicKey {
            user_id: fa.user_id,
            public_key: fa.public_key,
            access: fa.access_type,
        })
        .collect())
}
