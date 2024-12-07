use crate::domains::models::auth::{Certificate, User};
use crate::domains::models::device;
use crate::domains::repositories::{AuthRepository, DeviceRepository, RepositoryError};
use crypto_utils::CryptoUtils;
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct AuthService {
    auth_repository: Arc<dyn AuthRepository>,
    crypto_utils: Arc<Mutex<CryptoUtils>>,
    device_repository: Arc<dyn DeviceRepository>,
}

impl AuthService {
    pub fn new(
        auth_repository: Arc<dyn AuthRepository>,
        crypto_utils: Arc<Mutex<CryptoUtils>>,
        device_repository: Arc<dyn DeviceRepository>,
    ) -> Self {
        Self {
            auth_repository,
            crypto_utils,
            device_repository,
        }
    }

    pub async fn handle_sign_up(
        &self,
        username: &str,
        passphrase: &str,
        challenge: &str,
    ) -> Result<(User, String), String> {
        let primary_key = {
            let crypto = self.crypto_utils.lock().await;
            crypto
                .generate_keys(passphrase, username)
                .map_err(|e| e.to_string())?
        };

        let (device_key, device_id) = {
            let crypto = self.crypto_utils.lock().await;
            let keys = crypto
                .generate_keys(passphrase, username)
                .map_err(|e| e.to_string())?;
            let id = crypto
                .get_key_id(&keys.public_key)
                .map_err(|e| e.to_string())?;
            (keys, id)
        };
        let device_certificate = Certificate {
            private_key: device_key.private_key.clone(),
            public_key: device_key.public_key.clone(),
            salt: device_key.salt.clone(),
        };

        let certificate = Certificate {
            private_key: primary_key.private_key.clone(),
            public_key: primary_key.public_key.clone(),
            salt: primary_key.salt.clone(),
        };

        self.device_repository
            .save(&device_id, &device_key.public_key)
            .await
            .map_err(|e| e.to_string())?;

        self.auth_repository
            .store_certificate(
                &certificate,
                "primary_key".to_string(),
                "primary_key_salt".to_string(),
            )
            .await
            .map_err(|e| e.to_string())?;
        self.auth_repository
            .store_certificate(
                &device_certificate,
                "device_key".to_string(),
                "device_key_salt".to_string(),
            )
            .await
            .map_err(|e| e.to_string())?;
        let signature = {
            let crypto = self.crypto_utils.lock().await;
            crypto.sign_message(challenge).map_err(|e| e.to_string())?
        };

        Ok((
            User {
                username: username.to_string(),
                certificate,
            },
            signature,
        ))
    }

    pub async fn load_certificate(&self, passphrase: &str) -> Result<String, String> {
        let certificate = self
            .auth_repository
            .get_certificate("primary_key".to_string(), "primary_key_salt".to_string())
            .await
            .map_err(|e| e.to_string())?;

        let mut crypto = CryptoUtils::new();
        crypto
            .decrypt_and_load_certificate(&certificate.private_key, &certificate.salt, passphrase)
            .map_err(|e| e.to_string())?;

        {
            let mut crypto_utils = self.crypto_utils.lock().await;
            *crypto_utils = crypto;
        }

        let public_key = {
            let crypto = self.crypto_utils.lock().await;
            crypto
                .get_public_key()
                .map_err(|e| format!("Failed to get public key: {}", e))?
        };

        Ok(public_key)
    }

    pub async fn is_signed_up(&self) -> Result<bool, String> {
        self.auth_repository
            .is_signed_up()
            .await
            .map_err(|e| e.to_string())
    }

    pub async fn check_private_key_loaded(&self) -> Result<bool, String> {
        let crypto = self.crypto_utils.lock().await;
        Ok(crypto.is_cert_loaded())
    }

    pub async fn sign_challenge(&self, challenge: &str) -> Result<String, String> {
        let crypto = self.crypto_utils.lock().await;
        crypto
            .sign_message(challenge)
            .map_err(|e| format!("Signing error: {}", e))
    }

    pub async fn hash_and_sign(&self, message: &str) -> Result<String, String> {
        let crypto = self.crypto_utils.lock().await;
        crypto
            .sign_message(message)
            .map_err(|e| format!("Hash and sign error: {}", e))
    }

    pub async fn import_certificate(
        &self,
        certificate: String,
        passphrase: String,
    ) -> Result<Certificate, String> {
        let result = {
            let crypto = self.crypto_utils.lock().await;
            crypto
                .import_certificate(certificate, passphrase)
                .map_err(|e| format!("Error importing certificate: {}", e))?
        };

        let certificate = Certificate {
            private_key: result.private_key,
            public_key: result.public_key,
            salt: result.salt,
        };

        self.auth_repository
            .store_certificate(
                &certificate,
                "primary_key".to_string(),
                "primary_key_salt".to_string(),
            )
            .await
            .map_err(|e| e.to_string())?;

        Ok(certificate)
    }

    pub async fn export_certificate(&self, passphrase: String) -> Result<String, String> {
        let certificate = self
            .auth_repository
            .get_certificate("primary_key".to_string(), "primary_key_salt".to_string())
            .await
            .map_err(|e| e.to_string())?;

        let crypto = self.crypto_utils.lock().await;
        crypto
            .export_certificate(&passphrase, &certificate.private_key, &certificate.salt)
            .map_err(|e| format!("Error exporting certificate: {}", e))
    }

    pub async fn change_passphrase(
        &self,
        old_password: String,
        new_password: String,
    ) -> Result<Certificate, String> {
        let certificate = self
            .auth_repository
            .get_certificate("primary_key".to_string(), "primary_key_salt".to_string())
            .await
            .map_err(|e| e.to_string())?;

        let new_private_key = {
            let crypto = self.crypto_utils.lock().await;
            crypto
                .change_certificate_password(
                    &certificate.private_key,
                    &certificate.salt,
                    &old_password,
                    &new_password,
                )
                .map_err(|e| format!("Error changing certificate password: {}", e))?
        };

        let new_certificate = Certificate {
            private_key: new_private_key,
            public_key: certificate.public_key,
            salt: certificate.salt,
        };

        self.auth_repository
            .store_certificate(
                &new_certificate,
                "primary_key".to_string(),
                "primary_key_salt".to_string(),
            )
            .await
            .map_err(|e| e.to_string())?;

        Ok(new_certificate)
    }

    // Add other methods for certificate operations...
}
