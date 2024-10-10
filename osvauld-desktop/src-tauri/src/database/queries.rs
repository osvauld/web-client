use crate::types::{CredentialType, Folder};
use crate::DbConnection;

pub async fn add_folder(db: &DbConnection, folder_params: Folder) -> Result<Folder, String> {
    let folder: Option<Folder> = db
        .create("folders")
        .content(folder_params)
        .await
        .map_err(|e| format!("Failed to insert folder: {}", e))?;
    folder.ok_or_else(|| "Failed to retrieve created folder".to_string())
}

pub async fn get_all_folders(db: &DbConnection) -> Result<Vec<Folder>, String> {
    db.select("folders")
        .await
        .map_err(|e| format!("Failed to fetch folders: {}", e))
}
