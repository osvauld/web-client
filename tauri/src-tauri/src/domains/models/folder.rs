use chrono::Local;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Folder {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub shared: bool,
    pub access_type: String,
    pub created_at: i64,
    pub updated_at: i64,
}

impl Folder {
    pub fn new(name: String, description: Option<String>) -> Self {
        let now = Local::now().timestamp_millis();

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
