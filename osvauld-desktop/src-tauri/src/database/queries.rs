use crate::types::{CredentialType, Folder};
use crate::DbConnection;
use log::info;
use serde_json::to_string;

pub async fn fetch_credential(
    db: &DbConnection,
    credential_id: &str,
) -> Result<CredentialType, String> {
    let result: Option<CredentialType> = db
        .select(("credential", credential_id))
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    result.ok_or_else(|| "Credential not found".to_string())
}

pub async fn insert_credential(
    db: &DbConnection,
    credential: CredentialType,
) -> Result<CredentialType, String> {
    let created: Option<CredentialType> = db
        .create(("credential", &credential.credential_id))
        .content(credential)
        .await
        .map_err(|e| format!("Failed to insert credential: {}", e))?;

    created.ok_or_else(|| "Failed to retrieve created credential".to_string())
}

pub async fn add_folder(db: &DbConnection, folder_params: Folder) -> Result<Folder, String> {
    let folder: Option<Folder> = db
        .create("folders")
        .content(folder_params)
        .await
        .map_err(|e| format!("Failed to insert folder: {}", e))?;
    folder.ok_or_else(|| "Failed to retrieve created folder".to_string())
}
