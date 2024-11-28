use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncRecord {
    pub id: String,
    pub resource_id: String,
    pub resource_type: String,
    pub operation_type: String,
    pub source_device_id: String,
    pub target_device_id: String,
    pub status: String,
    pub folder_id: Option<String>,
    pub credential_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl SyncRecord {
    pub fn new_folder_sync(
        folder_id: String,
        operation_type: String,
        source_device_id: String,
        target_device_id: String,
    ) -> Self {
        let now = Utc::now().format("%Y-%m-%d %H:%M:%S%.3f").to_string();
        Self {
            id: Uuid::new_v4().to_string(),
            resource_id: folder_id.clone(),
            resource_type: "folder".to_string(),
            operation_type,
            source_device_id,
            target_device_id,
            status: "pending".to_string(),
            folder_id: Some(folder_id),
            credential_id: None,
            created_at: now.clone(),
            updated_at: now,
        }
    }

    pub fn new_credential_sync(
        credential_id: String,
        operation_type: String,
        source_device_id: String,
        target_device_id: String,
    ) -> Self {
        let now = Utc::now().format("%Y-%m-%d %H:%M:%S%.3f").to_string();
        Self {
            id: Uuid::new_v4().to_string(),
            resource_id: credential_id.clone(),
            resource_type: "credential".to_string(),
            operation_type,
            source_device_id,
            target_device_id,
            status: "pending".to_string(),
            folder_id: None,
            credential_id: Some(credential_id),
            created_at: now.clone(),
            updated_at: now,
        }
    }
}
