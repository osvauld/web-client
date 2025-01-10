use crate::database::schema::devices;
use crate::database::DbConnection;
use crate::domains::models::device::Device;
use crate::domains::repositories::{DeviceRepository, RepositoryError};
use crate::persistence::models::DeviceModel;
use async_trait::async_trait;
use chrono::Local;
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
    async fn save(&self, device: Device) -> Result<(), RepositoryError> {
        let mut conn = self.connection.lock().await;

        let device_model = DeviceModel {
            id: device.id,
            device_key: device.device_key,
            created_at: device.created_at,
            updated_at: device.updated_at,
        };

        diesel::insert_into(devices::table)
            .values(&device_model)
            .execute(&mut *conn)
            .map_err(|e| RepositoryError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    async fn find_by_id(&self, device_id: &str) -> Result<Device, RepositoryError> {
        let mut conn = self.connection.lock().await;

        let device = devices::table
            .find(device_id)
            .first::<DeviceModel>(&mut *conn)
            .map_err(|e| match e {
                diesel::NotFound => RepositoryError::NotFound,
                _ => RepositoryError::DatabaseError(e.to_string()),
            })?;

        Ok(device.into())
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
