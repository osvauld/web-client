use crate::database::schema::{folders, sync_records};
use crate::domains::models::{
    folder::Folder as DomainFolder, sync_record::SyncRecord as DomainSyncRecord,
};
use diesel::prelude::*;

#[derive(Queryable, Insertable)]
#[diesel(table_name = folders)]
pub struct FolderModel {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub shared: bool,
    pub access_type: String,
    pub created_at: String,
    pub updated_at: String,
}

impl From<&DomainFolder> for FolderModel {
    fn from(folder: &DomainFolder) -> Self {
        Self {
            id: folder.id.clone(),
            name: folder.name.clone(),
            description: folder.description.clone(),
            shared: folder.shared,
            access_type: folder.access_type.clone(),
            created_at: folder.created_at.clone(),
            updated_at: folder.updated_at.clone(),
        }
    }
}

impl From<FolderModel> for DomainFolder {
    fn from(model: FolderModel) -> Self {
        Self {
            id: model.id,
            name: model.name,
            description: model.description,
            shared: model.shared,
            access_type: model.access_type,
            created_at: model.created_at,
            updated_at: model.updated_at,
        }
    }
}

#[derive(Queryable, Insertable)]
#[diesel(table_name = sync_records)]
pub struct SyncRecordModel {
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

impl From<&DomainSyncRecord> for SyncRecordModel {
    fn from(record: &DomainSyncRecord) -> Self {
        Self {
            id: record.id.clone(),
            resource_id: record.resource_id.clone(),
            resource_type: record.resource_type.clone(),
            operation_type: record.operation_type.clone(),
            source_device_id: record.source_device_id.clone(),
            target_device_id: record.target_device_id.clone(),
            status: record.status.clone(),
            folder_id: record.folder_id.clone(),
            credential_id: record.credential_id.clone(),
            created_at: record.created_at.clone(),
            updated_at: record.updated_at.clone(),
        }
    }
}

impl From<SyncRecordModel> for DomainSyncRecord {
    fn from(model: SyncRecordModel) -> Self {
        Self {
            id: model.id,
            resource_id: model.resource_id,
            resource_type: model.resource_type,
            operation_type: model.operation_type,
            source_device_id: model.source_device_id,
            target_device_id: model.target_device_id,
            status: model.status,
            folder_id: model.folder_id,
            credential_id: model.credential_id,
            created_at: model.created_at,
            updated_at: model.updated_at,
        }
    }
}
