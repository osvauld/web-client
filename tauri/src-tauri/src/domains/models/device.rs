use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Device {
    pub id: String,
    pub device_key: String,
    pub created_at: String,
    pub updated_at: String,
}
