use super::p2p::AppState;
use crate::service::{
    add_credential_service, add_folder, get_all_folders, get_certificate_and_salt,
    get_credentials_for_folder, get_folder_access, get_public_key, is_signed_up, save_passphrase,
    sign_hashed_message, store_certificate_and_salt,
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
use tauri::State;
use tauri::Wry;
use tauri_plugin_store::Store;
use tauri_plugin_store::StoreExt;
use tokio::sync::Mutex;

pub static CRYPTO_UTILS: Lazy<Mutex<CryptoUtils>> = Lazy::new(|| Mutex::new(CryptoUtils::new()));

#[tauri::command]
pub fn get_system_locale() -> String {
    get_locale().unwrap_or_else(|| String::from("en-US"))
}
#[tauri::command]
pub async fn handle_crypto_action(
    action: String,
    data: Value,
    app_handle: tauri::AppHandle,
    db_connection: State<'_, DbConnection>,
) -> Result<CryptoResponse, String> {
    let store = app_handle.store("my_app_store8.bin").unwrap();
    match action.as_str() {
        "isSignedUp" => {
            let is_signed_up_result = is_signed_up(&store).await?;
            Ok(CryptoResponse::IsSignedUp {
                isSignedUp: is_signed_up_result,
            })
        }
        "savePassphrase" => {
            let input: SavePassphraseInput = serde_json::from_value(data)
                .map_err(|e| format!("Invalid savePassphrase input: {}", e))?;
            save_passphrase(
                &input.username,
                &input.passphrase,
                &input.challenge,
                &store,
                db_connection,
            )
            .await
        }

        "checkPvtLoaded" => {
            let is_loaded = {
                let crypto = CRYPTO_UTILS.lock().await;
                crypto.is_cert_loaded()
            };
            Ok(CryptoResponse::CheckPvtKeyLoaded(is_loaded))
        }
        "getPubKey" => {
            let input: LoadPvtKeyInput = serde_json::from_value(data).unwrap();
            get_public_key(&input.passphrase, &store).await
        }
        "signChallenge" => {
            let input: SignChallengeInput = serde_json::from_value(data)
                .map_err(|e| format!("Invalid signChallenge input: {}", e))?;
            let signature = {
                let crypto = CRYPTO_UTILS.lock().await;
                crypto
                    .sign_message(&input.challenge)
                    .map_err(|e| format!("Signing error: {}", e))?
            };

            Ok(CryptoResponse::Signature(signature))
        }
        "addCredential" => {
            log::info!("Adding credential....{:?}", data);
            let input: AddCredentialInput = serde_json::from_value(data)
                .map_err(|e| format!("Invalid addCredential input: {}", e))?;
            let folder_access = get_folder_access(&db_connection, &input.folder_id)
                .await
                .unwrap();

            let response = {
                let crypto = CRYPTO_UTILS.lock().await;
                crypto
                    .encrypt_data_for_users(input.credential_payload, folder_access)
                    .map_err(|e| format!("Failed to encrypt data: {}", e))?
            };

            log::info!("Response: {:?}", response);
            add_credential_service(
                &db_connection,
                response.encrypted_data,
                input.folder_id,
                response.access_list,
            )
            .await
            .unwrap();
            // let encrypted_fields = crypto
            //     .encrypt_fields_for_multiple_keys(input.users, input.add_credential_fields)
            //     .unwrap();
            Ok(CryptoResponse::IsSignedUp { isSignedUp: false })
        }
        "hashAndSign" => {
            let input: HashAndSignInput = serde_json::from_value(data)
                .map_err(|e| format!("Invalid hashAndSign input: {}", e))?;
            let signature = {
                let crypto = CRYPTO_UTILS.lock().await;
                crypto
                    .sign_message(&input.message)
                    .map_err(|e| format!("Hash and sign error: {}", e))?
            };
            Ok(CryptoResponse::IsSignedUp { isSignedUp: false })
        }
        "decryptMeta" => Ok(CryptoResponse::IsSignedUp { isSignedUp: false }),

        "importPvtKey" => {
            let input: ImportCertificateInput = serde_json::from_value(data)
                .map_err(|e| format!("Invalid importPvtKey input: {}", e))?;
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
        "exportCertificate" => {
            let passphrase = data["passphrase"]
                .as_str()
                .ok_or_else(|| "Invalid input: expected a passphrase".to_string())?;

            let (pvt_key, salt) = get_certificate_and_salt(&store)?;

            let exported_cert = {
                let crypto = CRYPTO_UTILS.lock().await;
                crypto
                    .export_certificate(passphrase, &pvt_key, &salt)
                    .map_err(|e| format!("Error exporting certificate: {}", e))?
            };

            Ok(CryptoResponse::ExportedCertificate(exported_cert))
        }

        "changePassphrase" => {
            let input: PasswordChangeInput = serde_json::from_value(data)
                .map_err(|e| format!("Invalid changePassphrase input: {}", e))?;

            let (pvt_key, salt) = get_certificate_and_salt(&store)?;

            let new_certificate = {
                let crypto = CRYPTO_UTILS.lock().await;
                crypto
                    .change_certificate_password(
                        &pvt_key,
                        &salt,
                        &input.old_password,
                        &input.new_password,
                    )
                    .map_err(|e| format!("Error changing certificate password: {}", e))?
            };
            // Store the new certificate
            store_certificate_and_salt(&store, &new_certificate, &salt)?;

            Ok(CryptoResponse::ChangedPassphrase(new_certificate))
        }

        "addFolder" => {
            let add_folder_params: AddFolderInput =
                serde_json::from_value(data).map_err(|e| format!("invalid input: {}", e))?;
            let _ = add_folder(
                &add_folder_params.name,
                &add_folder_params.description,
                &store,
                db_connection,
            )
            .await;
            Ok(CryptoResponse::IsSignedUp { isSignedUp: false })
        }
        "getFolder" => {
            let folders_response = get_all_folders(db_connection).await.unwrap();
            Ok(CryptoResponse::Folders(folders_response))
        }

        "getCredentialsForFolder" => {
            let input: GetCredentialForFolderInput =
                serde_json::from_value(data).map_err(|e| format!("invalid input: {}", e))?;
            let folder_id = input.folder_id;
            let db_credentials = get_credentials_for_folder(&db_connection, folder_id, &store)
                .await
                .unwrap();
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
                    .map_err(|e| format!("Error changing certificate password: {}", e))?
            };
            log::info!("Decrypted credentials: {:?}", decrypted_credentials);
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

            log::info!("Credential responses: {:?}", credential_responses);

            Ok(CryptoResponse::Credentials(credential_responses))
        }
        _ => Err(format!("Unknown action: {}", action)),
    }
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
