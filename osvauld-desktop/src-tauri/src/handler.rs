use crate::service::{
    decrypt_credentials, get_certificate_and_salt, get_public_key, initialize_database,
    is_signed_up, save_passphrase, sign_hashed_message, store_certificate_and_salt,
};
use crate::types::{
    AddCredentialInput, CryptoResponse, EncryptEditFieldsInput, HashAndSignInput,
    ImportCertificateInput, LoadPvtKeyInput, PasswordChangeInput, SavePassphraseInput,
    SignChallengeInput,
};
use crate::DbConnection;
use crypto_utils::types::{Credential, CredentialFields, PublicKey};
use crypto_utils::{CryptoUtils, ShareCredsInput};
use log::{error, info};
use once_cell::sync::Lazy;
use serde_json::Value;
use std::sync::Arc;
use std::sync::Mutex;
use tauri::State;
use tauri::Wry;
use tauri_plugin_store::StoreCollection;
use tokio::runtime::Runtime;
pub static CRYPTO_UTILS: Lazy<Mutex<CryptoUtils>> = Lazy::new(|| Mutex::new(CryptoUtils::new()));
#[tauri::command]
pub async fn handle_crypto_action(
    action: String,
    data: Value,
    stores: State<'_, StoreCollection<Wry>>,
    app_handle: tauri::AppHandle,
    db_connection: State<'_, DbConnection>,
    rt: State<'_, Arc<Runtime>>,
) -> Result<CryptoResponse, String> {
    match action.as_str() {
        "isSignedUp" => {
            let is_signed_up_result = is_signed_up(&app_handle, stores, db_connection).await?;
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
                &app_handle,
                stores,
            )
            .await
        }

        "checkPvtLoaded" => {
            let crypto = CRYPTO_UTILS.lock().map_err(|e| e.to_string())?;
            let is_loaded = crypto.is_cert_loaded();
            Ok(CryptoResponse::CheckPvtKeyLoaded(is_loaded))
        }
        "getPubKey" => {
            let input: LoadPvtKeyInput = serde_json::from_value(data).unwrap();
            get_public_key(&input.passphrase, &app_handle, stores).await
        }
        "signChallenge" => {
            let input: SignChallengeInput = serde_json::from_value(data)
                .map_err(|e| format!("Invalid signChallenge input: {}", e))?;
            let crypto = CRYPTO_UTILS.lock().map_err(|e| e.to_string())?;

            let signature = crypto
                .sign_message(&input.challenge)
                .map_err(|e| format!("Signing error: {}", e))?;

            Ok(CryptoResponse::Signature(signature))
        }
        "addCredential" => {
            let input: AddCredentialInput = serde_json::from_value(data)
                .map_err(|e| format!("Invalid addCredential input: {}", e))?;
            let crypto = CRYPTO_UTILS.lock().map_err(|e| e.to_string())?;
            let encrypted_fields = crypto
                .encrypt_fields_for_multiple_keys(input.users, input.add_credential_fields)
                .unwrap();
            Ok(CryptoResponse::EncryptedCredential(encrypted_fields))
        }

        "hashAndSign" => {
            let input: HashAndSignInput = serde_json::from_value(data)
                .map_err(|e| format!("Invalid hashAndSign input: {}", e))?;
            let mut crypto = CRYPTO_UTILS.lock().map_err(|e| e.to_string())?;
            let signature = sign_hashed_message(&mut crypto, &input.message)
                .map_err(|e| format!("Hash and sign error: {}", e))?;
            Ok(CryptoResponse::SignatureResponse { signature })
        }
        "decryptMeta" => {
            let credentials: Vec<Credential> = serde_json::from_value(data)
                .map_err(|e| format!("Invalid decryptMeta input: {}", e))?;
            let mut crypto = CRYPTO_UTILS.lock().map_err(|e| e.to_string())?;
            let decrypted_credentials = decrypt_credentials(&mut crypto, credentials)
                .map_err(|e| format!("Decryption error: {}", e))?;
            Ok(CryptoResponse::DecryptedCredentials(decrypted_credentials))
        }
        "createShareCredPayload" => {
            let creds: Vec<CredentialFields> = serde_json::from_value(data["creds"].clone())
                .map_err(|e| format!("Invalid creds input: {}", e))?;

            let selected_users: Vec<serde_json::Value> =
                serde_json::from_value(data["users"].clone())
                    .map_err(|e| format!("Invalid users input: {}", e))?;

            let users: Vec<PublicKey> = selected_users
                .into_iter()
                .map(|user| PublicKey {
                    id: user["id"].as_str().unwrap_or_default().to_string(),
                    public_key: user["publicKey"].as_str().unwrap_or_default().to_string(),
                    access_type: Some(user["accessType"].as_str().unwrap_or_default().to_string()),
                })
                .collect();

            let crypto = CRYPTO_UTILS.lock().map_err(|e| e.to_string())?;
            let result = crypto
                .create_share_creds_payload(ShareCredsInput {
                    selected_users: users,
                    credentials: creds,
                })
                .map_err(|e| format!("Error creating share creds payload: {}", e))?;

            Ok(CryptoResponse::ShareCredsPayload(result))
        }
        "decryptField" => {
            let encrypted_text = data
                .as_str()
                .ok_or_else(|| "Invalid input: expected a string".to_string())?;

            let crypto = CRYPTO_UTILS.lock().map_err(|e| e.to_string())?;
            let decrypted = crypto
                .decrypt_text(encrypted_text.to_string())
                .map_err(|e| format!("Error decrypting text: {}", e))?;

            Ok(CryptoResponse::DecryptedText(decrypted))
        }
        "importPvtKey" => {
            let input: ImportCertificateInput = serde_json::from_value(data)
                .map_err(|e| format!("Invalid importPvtKey input: {}", e))?;
            let crypto = CRYPTO_UTILS.lock().map_err(|e| e.to_string())?;
            let result = crypto
                .import_certificate(input.certificate, input.passphrase)
                .map_err(|e| format!("Error importing certificate: {}", e))?;
            store_certificate_and_salt(&app_handle, stores, &result.private_key, &result.salt)?;
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

            let (pvt_key, salt) = get_certificate_and_salt(&app_handle, stores)?;

            let crypto = CRYPTO_UTILS.lock().map_err(|e| e.to_string())?;
            let exported_cert = crypto
                .export_certificate(passphrase, &pvt_key, &salt)
                .map_err(|e| format!("Error exporting certificate: {}", e))?;

            Ok(CryptoResponse::ExportedCertificate(exported_cert))
        }

        "changePassphrase" => {
            let input: PasswordChangeInput = serde_json::from_value(data)
                .map_err(|e| format!("Invalid changePassphrase input: {}", e))?;

            let (pvt_key, salt) = get_certificate_and_salt(&app_handle, stores.clone())?;

            let crypto = CRYPTO_UTILS.lock().map_err(|e| e.to_string())?;
            let new_certificate = crypto
                .change_certificate_password(
                    &pvt_key,
                    &salt,
                    &input.old_password,
                    &input.new_password,
                )
                .map_err(|e| format!("Error changing certificate password: {}", e))?;

            // Store the new certificate
            store_certificate_and_salt(&app_handle, stores, &new_certificate, &salt)?;

            Ok(CryptoResponse::ChangedPassphrase(new_certificate))
        }
        "encryptEditFields" => {
            let input: EncryptEditFieldsInput = serde_json::from_value(data)
                .map_err(|e| format!("Invalid encryptEditFields input: {}", e))?;
            info!("Encrypting edit fields: {:?}", input);
            let crypto = CRYPTO_UTILS.lock().map_err(|e| e.to_string())?;
            let encrypted = crypto
                .encrypt_field_value(&input.field_value, input.users_to_share)
                .unwrap();
            Ok(CryptoResponse::EncryptedEditFields(encrypted))
        }
        _ => Err(format!("Unknown action: {}", action)),
    }
}
