use crate::database::schema::{credentials, folders, sync_records};
use crate::domains::models::{
    credential::Credential as DomainCredential, folder::Folder as DomainFolder,
    sync_record::SyncRecord as DomainSyncRecord,
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

#[derive(Queryable, Insertable, Selectable, QueryableByName, Debug, Clone)]
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

impl SyncRecordModel {
    pub fn to_domain_records(models: Vec<SyncRecordModel>) -> Vec<DomainSyncRecord> {
        models.into_iter().map(DomainSyncRecord::from).collect()
    }

    pub fn from_domain_records(records: Vec<DomainSyncRecord>) -> Vec<SyncRecordModel> {
        records
            .into_iter()
            .map(|r| SyncRecordModel::from(&r))
            .collect()
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

#[derive(Queryable, Insertable)]
#[diesel(table_name = credentials)]
pub struct CredentialModel {
    pub id: String,
    pub credential_type: String,
    pub data: String,
    pub folder_id: String,
    pub signature: String,
    pub permission: String,
    pub encrypted_key: String,
    pub updated_at: String,
    pub created_at: String,
}

impl From<&DomainCredential> for CredentialModel {
    fn from(credential: &DomainCredential) -> Self {
        Self {
            id: credential.id.clone(),
            credential_type: credential.credential_type.clone(),
            data: credential.data.clone(),
            folder_id: credential.folder_id.clone(),
            signature: credential.signature.clone(),
            permission: credential.permission.clone(),
            encrypted_key: credential.encrypted_key.clone(),
            created_at: chrono::Utc::now()
                .format("%Y-%m-%d %H:%M:%S%.3f")
                .to_string(),
            updated_at: chrono::Utc::now()
                .format("%Y-%m-%d %H:%M:%S%.3f")
                .to_string(),
        }
    }
}

impl From<CredentialModel> for DomainCredential {
    fn from(model: CredentialModel) -> Self {
        Self {
            id: model.id,
            credential_type: model.credential_type,
            data: model.data,
            folder_id: model.folder_id,
            signature: model.signature,
            permission: model.permission,
            encrypted_key: model.encrypted_key,
            created_at: model.created_at,
            updated_at: model.updated_at,
        }
    }
}

impl CredentialModel {
    // Convert Vec<CredentialModel> to Vec<DomainCredential>
    pub fn to_domain_credentials(models: Vec<CredentialModel>) -> Vec<DomainCredential> {
        models.into_iter().map(DomainCredential::from).collect()
    }

    // Convert Vec<DomainCredential> to Vec<CredentialModel>
    pub fn from_domain_credentials(credentials: Vec<DomainCredential>) -> Vec<CredentialModel> {
        credentials
            .into_iter()
            .map(|c| CredentialModel::from(&c))
            .collect()
    }
}