use crate::domains::models::credential::{Credential, DecryptedCredential};
use crate::domains::repositories::{CredentialRepository, RepositoryError};
use crypto_utils::CryptoUtils;
use serde_json::Value;
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
}

impl CredentialService {
    pub fn new(
        credential_repository: Arc<dyn CredentialRepository>,
        crypto_utils: Arc<Mutex<CryptoUtils>>,
    ) -> Self {
        Self {
            credential_repository,
            crypto_utils,
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
