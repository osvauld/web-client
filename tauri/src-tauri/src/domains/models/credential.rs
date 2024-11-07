use chrono::Utc;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Credential {
    pub id: String,
    pub credential_type: String,
    pub data: String,
    pub folder_id: String,
    pub signature: String,
    pub permission: String,
    pub encrypted_key: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone)]
pub struct DecryptedCredential {
    pub id: String,
    pub credential_type: String,
    pub data: Value,
    pub permission: String,
}

impl Credential {
    pub fn new(
        credential_type: String,
        data: String,
        folder_id: String,
        encrypted_key: String,
        signature: String,
    ) -> Self {
        let now = Utc::now().format("%Y-%m-%d %H:%M:%S%.3f").to_string();

        Self {
            id: uuid::Uuid::new_v4().to_string(),
            credential_type,
            data,
            folder_id,
            signature,
            permission: "read".to_string(), // Default permission
            encrypted_key,
            created_at: now.clone(),
            updated_at: now,
        }
    }
}
