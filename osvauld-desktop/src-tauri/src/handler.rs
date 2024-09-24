use crate::service::{
    decrypt_credentials, get_public_key, is_signed_up, save_passphrase, sign_hashed_message,
};
use crate::types::{
    AddCredentialInput, CryptoResponse, DecryptMetaInput, HashAndSignInput, LoadPvtKeyInput,
    SavePassphraseInput, SignChallengeInput,
};
use crypto_utils::types::Credential;
use crypto_utils::CryptoUtils;
use log::{error, info};
use once_cell::sync::Lazy;
use serde_json::Value;
use std::sync::Mutex;
use tauri::State;
use tauri::Wry;
use tauri_plugin_store::StoreCollection;

static CRYPTO_UTILS: Lazy<Mutex<CryptoUtils>> = Lazy::new(|| Mutex::new(CryptoUtils::new()));
#[tauri::command]
pub async fn handle_crypto_action(
    action: String,
    data: Value,
    stores: State<'_, StoreCollection<Wry>>,
    app_handle: tauri::AppHandle,
) -> Result<CryptoResponse, String> {
    info!("Received action: {:?}", action);
    info!("Received data: {:?}", data);

    match action.as_str() {
        "isSignedUp" => {
            let is_signed_up_result = is_signed_up(&app_handle, stores)?;
            Ok(CryptoResponse::IsSignedUp {
                isSignedUp: is_signed_up_result,
            })
        }
        "savePassphrase" => {
            let input: SavePassphraseInput = serde_json::from_value(data)
                .map_err(|e| format!("Invalid savePassphrase input: {}", e))?;
            let mut crypto = CRYPTO_UTILS.lock().map_err(|e| e.to_string())?;
            save_passphrase(
                &mut crypto,
                &input.username,
                &input.passphrase,
                &input.challenge,
                &app_handle,
                stores,
            )
        }

        "checkPvtLoaded" => {
            let crypto = CRYPTO_UTILS.lock().map_err(|e| e.to_string())?;
            let is_loaded = crypto.is_cert_loaded();
            Ok(CryptoResponse::CheckPvtKeyLoaded(is_loaded))
        }
        "getPubKey" => {
            let input: LoadPvtKeyInput = serde_json::from_value(data).unwrap();

            let (public_key, new_crypto_utils) =
                get_public_key(&input.passphrase, &app_handle, stores)?;

            // Update the CRYPTO_UTILS with the new instance
            *CRYPTO_UTILS.lock().map_err(|e| e.to_string())? = new_crypto_utils;

            Ok(CryptoResponse::PublicKey(public_key))
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
        // Add other action handlers here as needed
        _ => Err(format!("Unknown action: {}", action)),
    }
}
