use crate::database::schema::credentials;
use crate::domains::models::credential::Credential;
use crate::domains::repositories::{CredentialRepository, RepositoryError};
use crate::persistence::models::{CredentialModel, FolderModel};
use chrono::Local;

use crate::DbConnection;
use async_trait::async_trait;
use diesel::prelude::*;

pub struct SqliteCredentialRepository {
    connection: DbConnection,
}

impl SqliteCredentialRepository {
    pub fn new(connection: DbConnection) -> Self {
        Self { connection }
    }
}

#[async_trait]
impl CredentialRepository for SqliteCredentialRepository {
    async fn save(&self, credential: &Credential) -> Result<(), RepositoryError> {
        let credential_model = CredentialModel::from(credential);
        let mut conn = self.connection.lock().await;
        diesel::insert_into(credentials::table)
            .values(credential_model)
            .execute(&mut *conn)
            .map_err(|e| RepositoryError::DatabaseError(e.to_string()))?;
        Ok(())
    }

    async fn find_by_folder(&self, folder_id: &str) -> Result<Vec<Credential>, RepositoryError> {
        let mut conn = self.connection.lock().await;
        let credential_models = credentials::table
            .filter(credentials::folder_id.eq(folder_id))
            .filter(credentials::deleted.eq(false))
            .load::<CredentialModel>(&mut *conn)
            .map_err(|e| RepositoryError::DatabaseError(e.to_string()))?;

        Ok(CredentialModel::to_domain_credentials(credential_models))
    }

    async fn find_by_id(&self, id: &str) -> Result<Credential, RepositoryError> {
        let mut conn = self.connection.lock().await;
        let credential_model = credentials::table
            .find(id)
            .first::<CredentialModel>(&mut *conn)
            .map_err(|e| match e {
                diesel::NotFound => RepositoryError::NotFound,
                _ => RepositoryError::DatabaseError(e.to_string()),
            });
        Ok(credential_model?.into())
    }

    async fn delete_credential(&self, id: &str) -> Result<(), RepositoryError> {
        let mut conn = self.connection.lock().await;
        diesel::delete(credentials::table)
            .filter(credentials::id.eq(id))
            .execute(&mut *conn)
            .map_err(|e| RepositoryError::DatabaseError(e.to_string()))?;
        Ok(())
    }

    async fn soft_delete_credential(&self, id: &str) -> Result<(), RepositoryError> {
        let mut conn = self.connection.lock().await;
        let now = Local::now().timestamp_millis();
        diesel::update(credentials::table)
            .filter(credentials::id.eq(id))
            .set((
                // Set the deleted flag to true
                credentials::deleted.eq(true),
                // Record when the deletion happened
                credentials::deleted_at.eq(Some(now)),
                // Update the updated_at timestamp to track the change
                credentials::updated_at.eq(now),
            ))
            .execute(&mut *conn)
            .map_err(|e| RepositoryError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    async fn toggle_fav(&self, credential_id: &str) -> Result<(), RepositoryError> {
        let mut conn = self.connection.lock().await;
        let now = Local::now().timestamp_millis();

        // First get current favorite status
        let current_favorite: bool = credentials::table
            .select(credentials::favorite)
            .filter(credentials::id.eq(credential_id))
            .first(&mut *conn)
            .map_err(|e| match e {
                diesel::NotFound => RepositoryError::NotFound,
                _ => RepositoryError::DatabaseError(e.to_string()),
            })?;

        // Toggle favorite status
        diesel::update(credentials::table)
            .filter(credentials::id.eq(credential_id))
            .set((
                credentials::favorite.eq(!current_favorite),
                credentials::updated_at.eq(now),
            ))
            .execute(&mut *conn)
            .map_err(|e| RepositoryError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    async fn update_last_accessed(&self, credential_id: &str) -> Result<(), RepositoryError> {
        let mut conn = self.connection.lock().await;
        let now = Local::now().timestamp_millis();

        diesel::update(credentials::table)
            .filter(credentials::id.eq(credential_id))
            .set(credentials::last_accessed.eq(now))
            .execute(&mut *conn)
            .map_err(|e| match e {
                diesel::NotFound => RepositoryError::NotFound,
                _ => RepositoryError::DatabaseError(e.to_string()),
            })?;

        Ok(())
    }
}
