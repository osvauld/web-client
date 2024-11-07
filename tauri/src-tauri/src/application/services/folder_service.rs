// src/application/services/folder_service.rs
use crate::domains::models::{folder::Folder, sync_record::SyncRecord};
use crate::domains::repositories::{FolderRepository, RepositoryError, SyncRepository};
use std::sync::Arc;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum FolderServiceError {
    #[error("Repository error: {0}")]
    RepositoryError(#[from] RepositoryError),
    #[error("Invalid input: {0}")]
    ValidationError(String),
}

pub struct FolderService {
    folder_repository: Arc<dyn FolderRepository>,
    sync_repository: Arc<dyn SyncRepository>,
    device_id: String, // This could come from configuration
}

impl FolderService {
    pub fn new(
        folder_repository: Arc<dyn FolderRepository>,
        sync_repository: Arc<dyn SyncRepository>,
        device_id: String,
    ) -> Self {
        Self {
            folder_repository,
            sync_repository,
            device_id,
        }
    }

    pub async fn create_folder(
        &self,
        name: String,
        description: Option<String>,
    ) -> Result<Folder, FolderServiceError> {
        // Validate input
        if name.trim().is_empty() {
            return Err(FolderServiceError::ValidationError(
                "Name cannot be empty".to_string(),
            ));
        }

        // Create folder
        let folder = Folder::new(name, description);

        // Create sync record
        let sync_record = SyncRecord::new_folder_sync(
            folder.id.clone(),
            "create".to_string(),
            self.device_id.clone(),
            "2".to_string(), // TODO: Handle target devices properly
        );

        // Save folder and sync record in a transaction
        self.folder_repository.save(&folder).await?;
        self.sync_repository
            .save_sync_records(&[sync_record])
            .await?;

        Ok(folder)
    }

    pub async fn get_all_folders(&self) -> Result<Vec<Folder>, FolderServiceError> {
        self.folder_repository
            .find_all()
            .await
            .map_err(FolderServiceError::RepositoryError)
    }
}
