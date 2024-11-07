use super::p2p::AppState;
use crate::service::{
    add_credential_service, add_folder, get_all_folders, get_certificate_and_salt,
    get_credentials_for_folder, get_public_key, is_signed_up, save_passphrase, sign_hashed_message,
    store_certificate_and_salt,
};
use crate::types::{
    AddCredentialInput, AddFolderInput, CredentialResponse, CryptoResponse,
    GetCredentialForFolderInput, HashAndSignInput, ImportCertificateInput, LoadPvtKeyInput,
    PasswordChangeInput, SavePassphraseInput, SignChallengeInput,
};
use crate::DbConnection;
use crypto_utils::types::CredentialWithEncryptedKey as CredentialType;
use crypto_utils::CryptoUtils;
use log::{error, info};
use once_cell::sync::Lazy;
use serde_json::Value;
use std::sync::Arc;
use sys_locale::get_locale;
use tauri::command;
use tauri::AppHandle;
use tauri::State;
use tauri::Wry;
use tauri_plugin_store::Store;
use tauri_plugin_store::StoreExt;
use tokio::sync::Mutex;

pub static CRYPTO_UTILS: Lazy<Mutex<CryptoUtils>> = Lazy::new(|| Mutex::new(CryptoUtils::new()));

async fn get_store(app_handle: &AppHandle) -> Arc<tauri_plugin_store::Store<Wry>> {
    app_handle.store("my_app_store8.bin").unwrap()
}

#[tauri::command]
pub fn get_system_locale() -> String {
    get_locale().unwrap_or_else(|| String::from("en-US"))
}

#[tauri::command]
pub async fn check_signup_status(app_handle: AppHandle) -> Result<CryptoResponse, String> {
    let store = get_store(&app_handle).await;
    let is_signed_up_result = is_signed_up(&store).await?;
    Ok(CryptoResponse::IsSignedUp {
        isSignedUp: is_signed_up_result,
    })
}

#[tauri::command]
pub async fn handle_save_passphrase(
    input: SavePassphraseInput,
    app_handle: AppHandle,
    db_connection: State<'_, DbConnection>,
) -> Result<CryptoResponse, String> {
    let store = get_store(&app_handle).await;
    save_passphrase(
        &input.username,
        &input.passphrase,
        &input.challenge,
        &store,
        db_connection,
    )
    .await
}

#[tauri::command]
pub async fn check_private_key_loaded() -> Result<CryptoResponse, String> {
    let is_loaded = {
        let crypto = CRYPTO_UTILS.lock().await;
        crypto.is_cert_loaded()
    };
    Ok(CryptoResponse::CheckPvtKeyLoaded(is_loaded))
}

#[tauri::command]
pub async fn handle_get_public_key(
    input: LoadPvtKeyInput,
    app_handle: AppHandle,
) -> Result<CryptoResponse, String> {
    let store = get_store(&app_handle).await;
    get_public_key(&input.passphrase, &store).await
}

#[tauri::command]
pub async fn handle_sign_challenge(input: SignChallengeInput) -> Result<CryptoResponse, String> {
    let signature = {
        let crypto = CRYPTO_UTILS.lock().await;
        crypto
            .sign_message(&input.challenge)
            .map_err(|e| format!("Signing error: {}", e))?
    };
    Ok(CryptoResponse::Signature(signature))
}

#[tauri::command]
pub async fn handle_add_credential(
    input: AddCredentialInput,
    db_connection: State<'_, DbConnection>,
) -> Result<CryptoResponse, String> {
    let response = {
        let crypto = CRYPTO_UTILS.lock().await;
        crypto
            .add_credential(input.credential_payload)
            .map_err(|e| format!("Failed to encrypt data: {}", e))?
    };

    add_credential_service(
        &db_connection,
        response.encrypted_data,
        response.encrypted_key.clone(),
        input.credential_type,
        input.folder_id,
    )
    .await
    .map_err(|e| format!("Failed to add credential: {}", e))?;

    Ok(CryptoResponse::Success)
}

#[tauri::command]
pub async fn handle_hash_and_sign(input: HashAndSignInput) -> Result<CryptoResponse, String> {
    let signature = {
        let crypto = CRYPTO_UTILS.lock().await;
        crypto
            .sign_message(&input.message)
            .map_err(|e| format!("Hash and sign error: {}", e))?
    };
    Ok(CryptoResponse::Signature(signature))
}

#[tauri::command]
pub async fn handle_import_certificate(
    input: ImportCertificateInput,
    app_handle: AppHandle,
) -> Result<CryptoResponse, String> {
    let store = get_store(&app_handle).await;
    let result = {
        let crypto = CRYPTO_UTILS.lock().await;
        crypto
            .import_certificate(input.certificate, input.passphrase)
            .map_err(|e| format!("Error importing certificate: {}", e))?
    };
    store_certificate_and_salt(&store, &result.private_key, &result.salt)?;
    Ok(CryptoResponse::ImportedCertificate {
        certificate: result.private_key,
        publicKey: result.public_key,
        salt: result.salt,
    })
}

#[tauri::command]
pub async fn handle_export_certificate(
    passphrase: String,
    app_handle: AppHandle,
) -> Result<CryptoResponse, String> {
    let store = get_store(&app_handle).await;
    let (pvt_key, salt) = get_certificate_and_salt(&store)?;
    let exported_cert = {
        let crypto = CRYPTO_UTILS.lock().await;
        crypto
            .export_certificate(&passphrase, &pvt_key, &salt)
            .map_err(|e| format!("Error exporting certificate: {}", e))?
    };
    Ok(CryptoResponse::ExportedCertificate(exported_cert))
}

#[tauri::command]
pub async fn handle_change_passphrase(
    input: PasswordChangeInput,
    app_handle: AppHandle,
) -> Result<CryptoResponse, String> {
    let store = get_store(&app_handle).await;
    let (pvt_key, salt) = get_certificate_and_salt(&store)?;
    let new_certificate = {
        let crypto = CRYPTO_UTILS.lock().await;
        crypto
            .change_certificate_password(&pvt_key, &salt, &input.old_password, &input.new_password)
            .map_err(|e| format!("Error changing certificate password: {}", e))?
    };
    store_certificate_and_salt(&store, &new_certificate, &salt)?;
    Ok(CryptoResponse::ChangedPassphrase(new_certificate))
}

#[tauri::command]
pub async fn handle_add_folder(
    input: AddFolderInput,
    db_connection: State<'_, DbConnection>,
) -> Result<CryptoResponse, String> {
    add_folder(&input.name, &input.description, db_connection)
        .await
        .map_err(|e| format!("Failed to add folder: {}", e))?;
    Ok(CryptoResponse::Success)
}

#[tauri::command]
pub async fn handle_get_folders(
    db_connection: State<'_, DbConnection>,
) -> Result<CryptoResponse, String> {
    let folders_response = get_all_folders(db_connection)
        .await
        .map_err(|e| format!("Failed to get folders: {}", e))?;
    Ok(CryptoResponse::Folders(folders_response))
}

#[tauri::command]
pub async fn handle_get_credentials_for_folder(
    input: GetCredentialForFolderInput,
    app_handle: AppHandle,
    db_connection: State<'_, DbConnection>,
) -> Result<CryptoResponse, String> {
    let store = get_store(&app_handle).await;
    let db_credentials = get_credentials_for_folder(&db_connection, input.folder_id, &store)
        .await
        .map_err(|e| format!("Failed to get credentials: {}", e))?;

    let credentials: Vec<CredentialType> = db_credentials
        .into_iter()
        .map(|db_cred| CredentialType {
            id: db_cred.id,
            credential_type: db_cred.credential_type,
            data: db_cred.data,
            signature: db_cred.signature,
            permission: db_cred.permission,
            encrypted_key: db_cred.encrypted_key,
        })
        .collect();

    let decrypted_credentials = {
        let crypto = CRYPTO_UTILS.lock().await;
        crypto
            .decrypt_credentials(credentials)
            .map_err(|e| format!("Failed to decrypt credentials: {}", e))?
    };

    let credential_responses: Vec<CredentialResponse> = decrypted_credentials
        .into_iter()
        .map(|cred| {
            let parsed_data: Value = serde_json::from_str(&cred.data).unwrap_or_else(
                |_| serde_json::json!({"error": "Failed to parse credential data"}),
            );
            CredentialResponse {
                id: cred.id,
                data: parsed_data,
                permission: cred.permission,
            }
        })
        .collect();

    Ok(CryptoResponse::Credentials(credential_responses))
}

#[tauri::command]
pub async fn send_message(message: String, state: State<'_, AppState>) -> Result<(), String> {
    state
        .send_message(message)
        .await
        .map_err(|e| format!("Failed to send message: {}", e))
}

#[tauri::command]
pub async fn get_ticket(state: State<'_, AppState>) -> Result<String, String> {
    state
        .share_ticket()
        .await
        .map_err(|e| format!("Failed to generate ticket: {}", e))
}

#[tauri::command]
pub async fn connect_with_ticket(ticket: String, state: State<'_, AppState>) -> Result<(), String> {
    state
        .connect_with_ticket(&ticket)
        .await
        .map_err(|e| format!("Failed to connect: {}", e))
}
