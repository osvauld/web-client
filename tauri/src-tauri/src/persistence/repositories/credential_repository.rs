use crate::database::schema::credentials;
use crate::domains::models::credential::Credential;
use crate::domains::repositories::{CredentialRepository, RepositoryError};
use crate::persistence::models::{CredentialModel, FolderModel};

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
}
