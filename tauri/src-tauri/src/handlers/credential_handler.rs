use crate::application::services::CredentialService;
use crate::types::{
    AddCredentialInput, CredentialResponse, CryptoResponse, GetCredentialForFolderInput,
};
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn handle_add_credential(
    input: AddCredentialInput,
    credential_service: State<'_, Arc<CredentialService>>,
) -> Result<CryptoResponse, String> {
    credential_service
        .add_credential(
            input.credential_payload,
            input.credential_type,
            input.folder_id,
        )
        .await
        .map_err(|e| e.to_string())?;

    Ok(CryptoResponse::Success)
}

#[tauri::command]
pub async fn handle_get_credentials_for_folder(
    input: GetCredentialForFolderInput,
    credential_service: State<'_, Arc<CredentialService>>,
) -> Result<CryptoResponse, String> {
    let credentials = credential_service
        .get_credentials_for_folder(input.folder_id)
        .await
        .map_err(|e| e.to_string())?;

    let credential_responses = credentials
        .into_iter()
        .map(|cred| CredentialResponse {
            id: cred.id,
            data: cred.data,
            permission: cred.permission,
        })
        .collect();

    Ok(CryptoResponse::Credentials(credential_responses))
}
