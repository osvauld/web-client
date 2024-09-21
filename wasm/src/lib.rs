use crypto_utils::types::{
    BasicFields, Credential, CredentialFields, Field, PasswordChangeInput, PublicKey,
    ShareCredsInput, UrlMap,
};
use crypto_utils::CryptoUtils;
use once_cell::sync::Lazy;
use serde_wasm_bindgen::to_value;
use std::sync::Mutex;
use wasm_bindgen::prelude::*;

// Global instance of CryptoUtils
static CRYPTO_UTILS: Lazy<Mutex<CryptoUtils>> = Lazy::new(|| Mutex::new(CryptoUtils::new()));
#[wasm_bindgen]
pub fn init() -> Result<(), JsValue> {
    // Any initialization code if needed
    Ok(())
}
#[wasm_bindgen]
pub fn generate_and_encrypt_keys(password: &str, username: &str) -> Result<JsValue, JsValue> {
    let crypto = CRYPTO_UTILS
        .lock()
        .map_err(|e| JsError::new(&e.to_string()))?;
    let keys = crypto
        .generate_keys(password, username)
        .map_err(|e| JsError::new(&e.to_string()))?;
    Ok(to_value(&serde_json::json!({
        "certificate": keys.private_key,
        "public_key": keys.public_key,
        "salt": keys.salt,
    }))
    .map_err(|err| JsValue::from_str(&err.to_string()))?)
}

#[wasm_bindgen]
pub fn generate_keys_without_password(username: &str) -> Result<JsValue, JsValue> {
    let crypto = CRYPTO_UTILS
        .lock()
        .map_err(|e| JsError::new(&e.to_string()))?;
    let keys = crypto
        .generate_keys_without_password(username)
        .map_err(|e| JsError::new(&e.to_string()))?;
    Ok(to_value(&serde_json::json!({
        "certificate": keys.private_key,
        "public_key": keys.public_key,
        "salt": keys.salt,
    }))
    .map_err(|err| JsValue::from_str(&err.to_string()))?)
}

#[wasm_bindgen]
pub fn decrypt_and_store_keys(
    encrypted_cert_b64: &str,
    salt_b64: &str,
    passphrase: &str,
) -> Result<(), JsError> {
    let mut crypto = CRYPTO_UTILS
        .lock()
        .map_err(|e| JsError::new(&e.to_string()))?;
    crypto
        .decrypt_and_load_certificate(encrypted_cert_b64, salt_b64, passphrase)
        .map_err(|e| JsError::new(&e.to_string()))?;
    Ok(())
}

#[wasm_bindgen]
pub fn sign_message(message: &str) -> Result<String, JsError> {
    let crypto = CRYPTO_UTILS
        .lock()
        .map_err(|e| JsError::new(&e.to_string()))?;
    crypto
        .sign_message(message)
        .map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn encrypt_new_credential(public_keys: JsValue, fields: JsValue) -> Result<JsValue, JsError> {
    let crypto = CRYPTO_UTILS
        .lock()
        .map_err(|e| JsError::new(&e.to_string()))?;
    let public_keys: Vec<PublicKey> = serde_wasm_bindgen::from_value(public_keys)?;
    let fields: Vec<Field> = serde_wasm_bindgen::from_value(fields)?;
    let encrypted_fields = crypto
        .encrypt_fields_for_multiple_keys(public_keys, fields)
        .map_err(|e| JsError::new(&e.to_string()))?;
    Ok(serde_wasm_bindgen::to_value(&encrypted_fields)?)
}

#[wasm_bindgen]
pub fn decrypt_credentials(credentials: JsValue) -> Result<JsValue, JsError> {
    let crypto = CRYPTO_UTILS
        .lock()
        .map_err(|e| JsError::new(&e.to_string()))?;
    let creds: Vec<Credential> = serde_wasm_bindgen::from_value(credentials)?;
    let decrypted = crypto
        .decrypt_credentials(creds)
        .map_err(|e| JsError::new(&e.to_string()))?;
    Ok(serde_wasm_bindgen::to_value(&decrypted)?)
}

#[wasm_bindgen]
pub fn decrypt_text(encrypted_text: &str) -> Result<String, JsError> {
    let crypto = CRYPTO_UTILS
        .lock()
        .map_err(|e| JsError::new(&e.to_string()))?;
    crypto
        .decrypt_text(encrypted_text.to_string())
        .map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn decrypt_fields(credentials: JsValue) -> Result<JsValue, JsError> {
    let crypto = CRYPTO_UTILS
        .lock()
        .map_err(|e| JsError::new(&e.to_string()))?;
    let creds: Vec<CredentialFields> = serde_wasm_bindgen::from_value(credentials)?;
    let decrypted = crypto
        .decrypt_fields(creds)
        .map_err(|e| JsError::new(&e.to_string()))?;
    Ok(serde_wasm_bindgen::to_value(&decrypted)?)
}

#[wasm_bindgen]
pub fn encrypt_fields(fields: JsValue, public_key: &str) -> Result<JsValue, JsError> {
    let crypto = CRYPTO_UTILS
        .lock()
        .map_err(|e| JsError::new(&e.to_string()))?;
    let fields: Vec<BasicFields> = serde_wasm_bindgen::from_value(fields)?;
    let encrypted = crypto
        .encrypt_fields(fields, public_key)
        .map_err(|e| JsError::new(&e.to_string()))?;
    Ok(serde_wasm_bindgen::to_value(&encrypted)?)
}

#[wasm_bindgen]
pub fn sign_and_hash_message(text: &str) -> Result<String, JsError> {
    let crypto = CRYPTO_UTILS
        .lock()
        .map_err(|e| JsError::new(&e.to_string()))?;
    crypto
        .sign_and_hash_message(text)
        .map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn encrypt_field_value(field_value: &str, public_keys: JsValue) -> Result<JsValue, JsError> {
    let crypto = CRYPTO_UTILS
        .lock()
        .map_err(|e| JsError::new(&e.to_string()))?;
    let public_keys: Vec<PublicKey> = serde_wasm_bindgen::from_value(public_keys)?;
    let encrypted = crypto
        .encrypt_field_value(field_value, public_keys)
        .map_err(|e| JsError::new(&e.to_string()))?;
    Ok(serde_wasm_bindgen::to_value(&encrypted)?)
}

#[wasm_bindgen]
pub fn decrypt_urls(urls: JsValue) -> Result<JsValue, JsError> {
    let crypto = CRYPTO_UTILS
        .lock()
        .map_err(|e| JsError::new(&e.to_string()))?;
    let urls: Vec<UrlMap> = serde_wasm_bindgen::from_value(urls)?;
    let decrypted = crypto
        .decrypt_urls(urls)
        .map_err(|e| JsError::new(&e.to_string()))?;
    Ok(serde_wasm_bindgen::to_value(&decrypted)?)
}

#[wasm_bindgen]
pub fn import_certificate(cert_string: &str, passphrase: &str) -> Result<JsValue, JsValue> {
    let crypto = CRYPTO_UTILS
        .lock()
        .map_err(|e| JsError::new(&e.to_string()))?;
    let keys = crypto
        .import_certificate(cert_string.to_string(), passphrase.to_string())
        .map_err(|e| JsError::new(&e.to_string()))?;
    Ok(to_value(&serde_json::json!({
        "certificate": keys.private_key,
        "public_key": keys.public_key,
        "salt": keys.salt,
    }))
    .map_err(|err| JsValue::from_str(&err.to_string()))?)
}

#[wasm_bindgen]
pub fn export_certificate(
    passphrase: &str,
    enc_pvt_key: &str,
    salt: &str,
) -> Result<String, JsError> {
    let crypto = CRYPTO_UTILS
        .lock()
        .map_err(|e| JsError::new(&e.to_string()))?;
    crypto
        .export_certificate(passphrase, enc_pvt_key, salt)
        .map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn change_password(input: JsValue) -> Result<String, JsError> {
    let crypto = CRYPTO_UTILS
        .lock()
        .map_err(|e| JsError::new(&e.to_string()))?;
    let input: PasswordChangeInput = serde_wasm_bindgen::from_value(input)?;
    crypto
        .change_certificate_password(
            &input.enc_pvt_key,
            &input.salt,
            &input.old_password,
            &input.new_password,
        )
        .map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn is_cert_loaded() -> bool {
    CRYPTO_UTILS
        .lock()
        .map(|crypto| crypto.is_cert_loaded())
        .unwrap_or(false)
}

#[wasm_bindgen]
pub fn clear_cert() {
    if let Ok(mut crypto) = CRYPTO_UTILS.lock() {
        crypto.clear_cert();
    }
}

#[wasm_bindgen]
pub fn get_public_key() -> Result<String, JsError> {
    let crypto = CRYPTO_UTILS
        .lock()
        .map_err(|e| JsError::new(&e.to_string()))?;

    crypto
        .get_public_key()
        .map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn create_share_creds_payload(input: JsValue) -> Result<JsValue, JsError> {
    let crypto = CRYPTO_UTILS
        .lock()
        .map_err(|e| JsError::new(&e.to_string()))?;

    let input: ShareCredsInput = serde_wasm_bindgen::from_value(input)?;

    let result = crypto
        .create_share_creds_payload(input)
        .map_err(|e| JsError::new(&e.to_string()))?;

    Ok(serde_wasm_bindgen::to_value(&result)?)
}
