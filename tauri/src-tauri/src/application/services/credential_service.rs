use crate::application::services::P2PService;
use crate::database::schema::sync_records::{credential_id, target_device_id};

use crate::domains::models::credential::{Credential, DecryptedCredential};
use crate::domains::models::sync_record::SyncRecord;
use crate::domains::repositories::{CredentialRepository, RepositoryError, SyncRepository};
use crypto_utils::CryptoUtils;
use serde_json::Value;
use std::result::Result::Ok;
use std::sync::Arc;
use thiserror::Error;
use tokio::sync::Mutex;

#[derive(Error, Debug)]
pub enum CredentialServiceError {
    #[error("Repository error: {0}")]
    RepositoryError(#[from] RepositoryError),
    #[error("Crypto error: {0}")]
    CryptoError(String),
    #[error("Parse error: {0}")]
    ParseError(String),
}

pub struct CredentialService {
    credential_repository: Arc<dyn CredentialRepository>,
    crypto_utils: Arc<Mutex<CryptoUtils>>,
    sync_repository: Arc<dyn SyncRepository>,
    p2p_service: Arc<P2PService>,
}

impl CredentialService {
    pub fn new(
        credential_repository: Arc<dyn CredentialRepository>,
        crypto_utils: Arc<Mutex<CryptoUtils>>,
        sync_repository: Arc<dyn SyncRepository>,
        p2p_service: Arc<P2PService>,
    ) -> Self {
        Self {
            credential_repository,
            crypto_utils,
            sync_repository,
            p2p_service,
        }
    }

    pub async fn add_credential(
        &self,
        credential_payload: String,
        credential_type: String,
        folder_id: String,
    ) -> Result<(), CredentialServiceError> {
        // Encrypt the credential
        let encrypted = {
            let crypto = self.crypto_utils.lock().await;
            crypto
                .add_credential(credential_payload)
                .map_err(|e| CredentialServiceError::CryptoError(e.to_string()))?
        };

        // Create and save the credential
        let credential = Credential::new(
            credential_type,
            encrypted.encrypted_data,
            folder_id,
            encrypted.encrypted_key,
            "signature".to_string(), // TODO: Implement proper signing
        );

        self.credential_repository
            .save(&credential)
            .await
            .map_err(CredentialServiceError::RepositoryError)?;
        let sync_record = SyncRecord::new_credential_sync(
            credential.id.clone(),
            "create".to_string(),
            "1".to_string(),
            "2".to_string(),
        );
        self.sync_repository
            .save_sync_records(&[sync_record])
            .await?;
        self.p2p_service.handle_sync_request().await;

        Ok(())
    }

    pub async fn get_credentials_for_folder(
        &self,
        folder_id: String,
    ) -> Result<Vec<DecryptedCredential>, CredentialServiceError> {
        // Get encrypted credentials
        let encrypted_credentials = self
            .credential_repository
            .find_by_folder(&folder_id)
            .await
            .map_err(CredentialServiceError::RepositoryError)?;

        // Convert to crypto utils format
        let crypto_credentials = encrypted_credentials
            .into_iter()
            .map(|cred| crypto_utils::types::CredentialWithEncryptedKey {
                id: cred.id,
                credential_type: cred.credential_type,
                data: cred.data,
                signature: cred.signature,
                permission: cred.permission,
                encrypted_key: cred.encrypted_key,
            })
            .collect();

        // Decrypt credentials
        let decrypted_credentials = {
            let crypto = self.crypto_utils.lock().await;
            crypto
                .decrypt_credentials(crypto_credentials)
                .map_err(|e| CredentialServiceError::CryptoError(e.to_string()))?
        };

        // Parse and convert to domain model
        let credentials = decrypted_credentials
            .into_iter()
            .map(|cred| {
                let parsed_data: Value = serde_json::from_str(&cred.data).unwrap_or_else(
                    |_| serde_json::json!({"error": "Failed to parse credential data"}),
                );

                DecryptedCredential {
                    id: cred.id,
                    credential_type: cred.credential_type,
                    data: parsed_data,
                    permission: cred.permission,
                }
            })
            .collect();

        Ok(credentials)
    }
}
