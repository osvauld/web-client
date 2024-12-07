use crate::database::schema::devices;
use crate::database::DbConnection;
use crate::domains::models::device::Device;
use crate::domains::repositories::{DeviceRepository, RepositoryError};
use crate::persistence::models::DeviceModel;
use async_trait::async_trait;
use chrono::Utc;
use diesel::prelude::*;

pub struct SqliteDeviceRepository {
    connection: DbConnection,
}

impl SqliteDeviceRepository {
    pub fn new(connection: DbConnection) -> Self {
        Self { connection }
    }
}

#[async_trait]
impl DeviceRepository for SqliteDeviceRepository {
    async fn save(&self, id: &str, device_key: &str) -> Result<(), RepositoryError> {
        let mut conn = self.connection.lock().await;
        let now = Utc::now().format("%Y-%m-%d %H:%M:%S%.3f").to_string();

        let device_model = DeviceModel {
            id: id.to_string(),
            device_key: device_key.to_string(),
            created_at: now.clone(),
            updated_at: now,
        };

        diesel::insert_into(devices::table)
            .values(&device_model)
            .execute(&mut *conn)
            .map_err(|e| RepositoryError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    async fn find_by_id(&self, device_id: &str) -> Result<String, RepositoryError> {
        let mut conn = self.connection.lock().await;

        let device = devices::table
            .find(device_id)
            .first::<DeviceModel>(&mut *conn)
            .map_err(|e| match e {
                diesel::NotFound => RepositoryError::NotFound,
                _ => RepositoryError::DatabaseError(e.to_string()),
            })?;

        Ok(device.device_key)
    }
    async fn get_all_devices(&self) -> Result<Vec<Device>, RepositoryError> {
        let mut conn = self.connection.lock().await;

        let device_models = devices::table
            .order_by(devices::created_at.desc())
            .load::<DeviceModel>(&mut *conn)
            .map_err(|e| RepositoryError::DatabaseError(e.to_string()))?;

        Ok(DeviceModel::to_domain_devices(device_models))
    }
}
