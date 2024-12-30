use crate::domains::models::sync_record;
use crate::domains::models::{credential::Credential, folder::Folder, sync_record::SyncRecord};
use crate::domains::repositories::{
    CredentialRepository, DeviceRepository, FolderRepository, RepositoryError, StoreRepository,
    SyncRepository,
};
use log::{error, info};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SyncPayload {
    pub sync_record: SyncRecord,
    pub data: SyncData,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type")]
pub enum SyncData {
    Folder(Folder),
    Credential(Credential),
}

pub struct SyncService {
    sync_repository: Arc<dyn SyncRepository>,
    folder_repository: Arc<dyn FolderRepository>,
    credential_repository: Arc<dyn CredentialRepository>,
    device_repository: Arc<dyn DeviceRepository>,
    store_repository: Arc<dyn StoreRepository>,
}

impl SyncService {
    pub fn new(
        sync_repository: Arc<dyn SyncRepository>,
        folder_repository: Arc<dyn FolderRepository>,
        credential_repository: Arc<dyn CredentialRepository>,
        device_repository: Arc<dyn DeviceRepository>,
        store_repository: Arc<dyn StoreRepository>,
    ) -> Self {
        Self {
            sync_repository,
            folder_repository,
            credential_repository,
            device_repository,
            store_repository,
        }
    }

    pub async fn add_new_device_sync(
        &self,
        device_key: String,
        device_public_key: String,
    ) -> Result<(), RepositoryError> {
        let _ = self
            .device_repository
            .save(&device_key, &device_public_key)
            .await;
        let device_id = self.store_repository.get_device_key().await?;
        let sync_records = self
            .sync_repository
            .get_sync_records_by_device_id(&device_id)
            .await?;

        todo!()
    }

    pub async fn get_next_pending_sync(&self) -> Result<Option<SyncPayload>, RepositoryError> {
        // Get the next pending sync record for target device 2
        let pending_records = self.sync_repository.get_pending_records("2").await?;
        info!("Found {} pending records", pending_records.len());
        // Get the oldest pending record
        let sync_record = match pending_records.first() {
            Some(record) => record.clone(),
            None => return Ok(None),
        };

        // Fetch associated data based on resource type
        let data = match sync_record.resource_type.as_str() {
            "folder" => {
                let folder = self
                    .folder_repository
                    .find_by_id(&sync_record.resource_id)
                    .await?;
                SyncData::Folder(folder)
            }
            "credential" => {
                let credential = self
                    .credential_repository
                    .find_by_id(&sync_record.resource_id)
                    .await?;
                log::info!("found credential {:?}", credential);
                SyncData::Credential(credential)
            }
            _ => {
                return Err(RepositoryError::DatabaseError(format!(
                    "Unknown resource type: {}",
                    sync_record.resource_type
                )))
            }
        };

        Ok(Some(SyncPayload { sync_record, data }))
    }

    pub async fn update_sync_status(
        &self,
        sync_id: &str,
        status: &str,
    ) -> Result<(), RepositoryError> {
        self.sync_repository.update_status(sync_id, status).await
    }

    pub async fn process_sync_payload(&self, payload: &SyncPayload) -> Result<(), RepositoryError> {
        log::info!(
            "Processing sync payload for resource: {}",
            payload.sync_record.resource_type
        );

        match &payload.data {
            SyncData::Folder(folder) => {
                log::info!("Processing folder sync: {}", folder.id);
                match payload.sync_record.operation_type.as_str() {
                    "create" => {
                        log::info!("Creating folder: {}", folder.name);
                        self.folder_repository.save(folder).await?;
                    }
                    "update" => {
                        log::info!("Updating folder: {}", folder.name);
                        self.folder_repository.save(folder).await?;
                    }
                    "delete" => {
                        log::info!("Delete operation for folder: {}", folder.id);
                        // TODO: Implement delete in folder repository
                        // self.folder_repository.delete(&folder.id).await?;
                    }
                    op => {
                        log::error!("Unknown folder operation: {}", op);
                        return Err(RepositoryError::DatabaseError(format!(
                            "Unknown operation type: {}",
                            op
                        )));
                    }
                }
            }
            SyncData::Credential(credential) => {
                log::info!("Processing credential sync: {}", credential.id);
                match payload.sync_record.operation_type.as_str() {
                    "create" => {
                        log::info!("Creating credential in folder: {}", credential.folder_id);
                        self.credential_repository.save(credential).await?;
                    }
                    "update" => {
                        log::info!("Updating credential: {}", credential.id);
                        self.credential_repository.save(credential).await?;
                    }
                    "delete" => {
                        log::info!("Delete operation for credential: {}", credential.id);
                        // TODO: Implement delete in credential repository
                        // self.credential_repository.delete(&credential.id).await?;
                    }
                    op => {
                        log::error!("Unknown credential operation: {}", op);
                        return Err(RepositoryError::DatabaseError(format!(
                            "Unknown operation type: {}",
                            op
                        )));
                    }
                }
            }
        }

        // Update the sync record status if needed
        // self.sync_repository.update_status(
        //     &payload.sync_record.id,
        //     "processed"
        // ).await?;

        log::info!("Successfully processed sync payload");
        Ok(())
    }

    pub async fn add_folder_to_sync(&self, folder: Folder) -> Result<(), RepositoryError> {
        let device_id = self.store_repository.get_device_key().await?;
        let devices = self.device_repository.get_all_devices().await?;
        for device in devices {
            let mut sync_record = SyncRecord::new_folder_sync(
                folder.id.clone(),
                "create".to_string(),
                device_id.clone(),
                device.id.clone(),
            );
            if device_id == device.id.clone() {
                sync_record.status = "complete".to_string();
            }
            self.sync_repository
                .save_sync_records(&[sync_record])
                .await?;
        }
        Ok(())
    }

    pub async fn add_credential_to_sync(
        &self,
        credential: Credential,
    ) -> Result<(), RepositoryError> {
        let device_id = self.store_repository.get_device_key().await?;
        let devices = self.device_repository.get_all_devices().await?;
        for device in devices {
            let mut sync_record = SyncRecord::new_credential_sync(
                credential.id.clone(),
                "create".to_string(),
                device_id.clone(),
                device.id.clone(),
            );
            if device_id == device.id.clone() {
                sync_record.status = "complete".to_string()
            }
            self.sync_repository
                .save_sync_records(&[sync_record])
                .await?;
        }
        Ok(())
    }
}
