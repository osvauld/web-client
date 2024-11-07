use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Folder {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub shared: bool,
    pub access_type: String,
    pub created_at: String,
    pub updated_at: String,
}

impl Folder {
    pub fn new(name: String, description: Option<String>) -> Self {
        let now = Utc::now().format("%Y-%m-%d %H:%M:%S%.3f").to_string();
        Self {
            id: Uuid::new_v4().to_string(),
            name,
            description,
            shared: true,
            access_type: "manager".to_string(),
            created_at: now.clone(),
            updated_at: now,
        }
    }
}
