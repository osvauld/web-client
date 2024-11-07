use crate::database::schema::sync_records;
use crate::database::DbConnection;
use crate::domains::models::sync_record::SyncRecord;
use crate::domains::repositories::{RepositoryError, SyncRepository};
use crate::persistence::models::SyncRecordModel;
use async_trait::async_trait;
use diesel::prelude::*;

pub struct SqliteSyncRepository {
    connection: DbConnection,
}

impl SqliteSyncRepository {
    pub fn new(connection: DbConnection) -> Self {
        Self { connection }
    }
}

#[async_trait]
impl SyncRepository for SqliteSyncRepository {
    async fn save_sync_records(&self, records: &[SyncRecord]) -> Result<(), RepositoryError> {
        let mut conn = self.connection.lock().await;
        let sync_models: Vec<SyncRecordModel> =
            records.iter().map(|r| SyncRecordModel::from(r)).collect();

        diesel::insert_into(sync_records::table)
            .values(&sync_models)
            .execute(&mut *conn)
            .map_err(|e| RepositoryError::DatabaseError(e.to_string()))?;
        Ok(())
    }
}
