// src/handlers/auth_handler.rs
use crate::application::services::AuthService;
use crate::types::{
    AddDeviceInput, CryptoResponse, ExportedCertificate, HashAndSignInput, LoadPvtKeyInput,
    PasswordChangeInput, SavePassphraseInput, SignChallengeInput,
};
use std::sync::Arc;
use tauri::{AppHandle, State};
use tauri_plugin_store::StoreExt;

#[tauri::command]
pub async fn check_signup_status(app_handle: AppHandle) -> Result<CryptoResponse, String> {
    let store = app_handle.store("my_app_store12.bin").unwrap();
    let is_signed_up_result = store.get("certificate").is_some();
    Ok(CryptoResponse::IsSignedUp {
        isSignedUp: is_signed_up_result,
    })
}

#[tauri::command]
pub async fn handle_sign_up(
    input: SavePassphraseInput,
    app_handle: AppHandle,
    auth_service: State<'_, Arc<AuthService>>,
) -> Result<CryptoResponse, String> {
    let (user, signature) = auth_service
        .handle_sign_up(&input.username, &input.passphrase, &input.challenge)
        .await?;

    Ok(CryptoResponse::SavePassphrase {
        signature,
        username: user.username,
        deviceKey: user.certificate.public_key.clone(),
        encryptionKey: user.certificate.public_key,
    })
}

#[tauri::command]
pub async fn check_private_key_loaded(
    auth_service: State<'_, Arc<AuthService>>,
) -> Result<CryptoResponse, String> {
    let is_loaded = auth_service.check_private_key_loaded().await?;
    Ok(CryptoResponse::CheckPvtKeyLoaded(is_loaded))
}

#[tauri::command]
pub async fn handle_get_public_key(
    input: LoadPvtKeyInput,
    auth_service: State<'_, Arc<AuthService>>,
) -> Result<CryptoResponse, String> {
    let public_key = auth_service.load_certificate(&input.passphrase).await?;
    Ok(CryptoResponse::PublicKey(public_key))
}

#[tauri::command]
pub async fn handle_sign_challenge(
    input: SignChallengeInput,
    auth_service: State<'_, Arc<AuthService>>,
) -> Result<CryptoResponse, String> {
    let signature = auth_service.sign_challenge(&input.challenge).await?;
    Ok(CryptoResponse::Signature(signature))
}

#[tauri::command]
pub async fn handle_hash_and_sign(
    input: HashAndSignInput,
    auth_service: State<'_, Arc<AuthService>>,
) -> Result<CryptoResponse, String> {
    let signature = auth_service.hash_and_sign(&input.message).await?;
    Ok(CryptoResponse::Signature(signature))
}

#[tauri::command]
pub async fn handle_add_device(
    input: AddDeviceInput,
    auth_service: State<'_, Arc<AuthService>>,
) -> Result<CryptoResponse, String> {
    let device_id = auth_service
        .add_device(input.certificate, input.passphrase)
        .await?;
    todo!()
}

#[tauri::command]
pub async fn handle_export_certificate(
    input: ExportedCertificate,
    auth_service: State<'_, Arc<AuthService>>,
) -> Result<CryptoResponse, String> {
    let exported_cert = auth_service.export_certificate(input.passphrase).await?;
    Ok(CryptoResponse::ExportedCertificate(exported_cert))
}

#[tauri::command]
pub async fn handle_change_passphrase(
    input: PasswordChangeInput,
    auth_service: State<'_, Arc<AuthService>>,
) -> Result<CryptoResponse, String> {
    let new_certificate = auth_service
        .change_passphrase(input.old_password, input.new_password)
        .await?;

    Ok(CryptoResponse::ChangedPassphrase(
        new_certificate.private_key,
    ))
}
