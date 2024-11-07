use crate::domains::models::{folder::Folder, sync_record::SyncRecord};
use async_trait::async_trait;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum RepositoryError {
    #[error("Database error: {0}")]
    DatabaseError(String),
    #[error("Not found")]
    NotFound,
}

#[async_trait]
pub trait FolderRepository: Send + Sync {
    async fn save(&self, folder: &Folder) -> Result<(), RepositoryError>;
    async fn find_all(&self) -> Result<Vec<Folder>, RepositoryError>;
    async fn find_by_id(&self, id: &str) -> Result<Folder, RepositoryError>;
}

#[async_trait]
pub trait SyncRepository: Send + Sync {
    async fn save_sync_records(&self, records: &[SyncRecord]) -> Result<(), RepositoryError>;
}
