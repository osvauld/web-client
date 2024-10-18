mod crypto_core;
mod errors;
pub mod types;

use crate::crypto_core::{
    decrypt_certificate, decrypt_text_pgp, decrypt_with_aes, encrypt_certificate, encrypt_text_pgp,
    encrypt_with_aes, generate_aes_key, generate_certificate, get_public_key_armored,
    get_recipient, get_salt_arr, get_signing_keypair, hash_text_sha512, sign_message,
};
use crate::errors::CryptoUtilsError;
pub use crate::types::{EncryptedDataWithAccess, GeneratedKeys, UserAccess, UserPublicKey};
use anyhow::{Error as AnyhowError, Result};
use argon2::password_hash::rand_core::OsRng;
use base64::{decode, encode};
use openpgp::{policy::StandardPolicy, serialize::Marshal, Cert};
use rand::RngCore;
use sequoia_openpgp::{self as openpgp};
use std::error::Error;
use std::str::FromStr;

pub struct CryptoUtils {
    cert: Option<Cert>,
}

impl CryptoUtils {
    pub fn new() -> Self {
        Self { cert: None }
    }

    pub fn is_cert_loaded(&self) -> bool {
        self.cert.is_some()
    }

    pub fn clear_cert(&mut self) {
        self.cert = None;
    }

    pub fn generate_keys(
        &self,
        password: &str,
        username: &str,
    ) -> Result<GeneratedKeys, Box<dyn Error>> {
        let cert = generate_certificate(username)?;
        println!("Certificate generated. Fingerprint: {}", cert.fingerprint());
        let mut salt = [0u8; 16];
        OsRng.fill_bytes(&mut salt);
        let mut cert_data = Vec::new();
        cert.as_tsk().serialize(&mut cert_data)?;
        let encrypted_private_key = encrypt_certificate(&cert_data, password, &salt)?;
        let public_key = get_public_key_armored(&cert)?;

        Ok(GeneratedKeys {
            private_key: encrypted_private_key,
            public_key,
            salt: encode(salt),
        })
    }

    pub fn generate_keys_without_password(
        &self,
        username: &str,
    ) -> Result<GeneratedKeys, Box<dyn Error>> {
        let cert = generate_certificate(username)?;
        println!("Certificate generated. Fingerprint: {}", cert.fingerprint());
        let mut cert_data = Vec::new();
        cert.as_tsk().serialize(&mut cert_data)?;
        let encoded_private_key = encode(cert_data);
        let public_key = get_public_key_armored(&cert)?;

        Ok(GeneratedKeys {
            private_key: encoded_private_key,
            public_key,
            salt: encode("".as_bytes()),
        })
    }

    pub fn decrypt_and_load_certificate(
        &mut self,
        encrypted_cert_b64: &str,
        salt_b64: &str,
        passphrase: &str,
    ) -> Result<(), CryptoUtilsError> {
        let cert = decrypt_certificate(encrypted_cert_b64, salt_b64, passphrase)
            .map_err(|e| CryptoUtilsError::CertificateDecryptionError(e.to_string()))?;
        self.cert = Some(cert);
        Ok(())
    }

    pub fn sign_message(&self, message: &str) -> Result<String, CryptoUtilsError> {
        let cert = self
            .cert
            .as_ref()
            .ok_or(CryptoUtilsError::NoCertificateError)?;
        let keypair = get_signing_keypair(cert)
            .map_err(|e| CryptoUtilsError::SigningKeyError(e.to_string()))?;
        let signature = sign_message(&keypair, message)
            .map_err(|e| CryptoUtilsError::SigningError(e.to_string()))?;
        Ok(encode(signature))
    }

    pub fn sign_and_hash_message(&self, message: &str) -> Result<String, Box<dyn Error>> {
        let hash_text = hash_text_sha512(message)?;
        let hash_base64 = encode(&hash_text);
        let signature = self.sign_message(&hash_base64)?;
        Ok(signature)
    }

    pub fn import_certificate(
        &self,
        cert_string: String,
        passphrase: String,
    ) -> Result<GeneratedKeys, Box<dyn Error>> {
        let cert = Cert::from_str(&cert_string)?;
        let public_key = get_public_key_armored(&cert)?;
        let mut salt = [0u8; 16];
        OsRng.fill_bytes(&mut salt);
        let mut cert_data = Vec::new();
        cert.as_tsk().serialize(&mut cert_data)?;
        let enc_priv_key = encrypt_certificate(&cert_data, &passphrase, &salt)?;
        Ok(GeneratedKeys {
            private_key: enc_priv_key,
            public_key,
            salt: encode(salt),
        })
    }

    pub fn export_certificate(
        &self,
        passphrase: &str,
        enc_pvt_key: &str,
        salt: &str,
    ) -> Result<String> {
        let cert = decrypt_certificate(enc_pvt_key, salt, passphrase)
            .map_err(|e| CryptoUtilsError::CertificateDecryptionError(e.to_string()))?;
        let mut armored = Vec::new();
        cert.as_tsk().armored().serialize(&mut armored)?;
        Ok(String::from_utf8(armored)?)
    }

    pub fn change_certificate_password(
        &self,
        encrypted_cert_b64: &str,
        salt_b64: &str,
        old_password: &str,
        new_password: &str,
    ) -> Result<String, Box<dyn Error>> {
        let cert = decrypt_certificate(encrypted_cert_b64, salt_b64, old_password)
            .map_err(|e| CryptoUtilsError::CertificateDecryptionError(e.to_string()))?;

        let mut cert_data = Vec::new();
        cert.as_tsk().serialize(&mut cert_data)?;
        let salt_array = get_salt_arr(salt_b64)?;

        let new_encrypted_cert = encrypt_certificate(&cert_data, new_password, &salt_array)?;

        Ok(new_encrypted_cert)
    }

    pub fn get_public_key(&self) -> Result<String> {
        let cert = self
            .cert
            .as_ref()
            .ok_or_else(|| AnyhowError::msg("No certificate loaded"))?;
        get_public_key_armored(cert)
    }

    pub fn encrypt_with_generated_aes_key(
        &self,
        plaintext: &str,
    ) -> Result<(String, String), Box<dyn std::error::Error>> {
        let aes_key = generate_aes_key();
        let ciphertext = encrypt_with_aes(&aes_key, plaintext)?;
        let encoded_key = encode(aes_key);
        Ok((ciphertext, encoded_key))
    }

    pub fn decrypt_with_aes_key(
        &self,
        ciphertext: &str,
        encoded_key: &str,
    ) -> Result<String, Box<dyn std::error::Error>> {
        let key_bytes = decode(encoded_key)?;
        let plaintext = decrypt_with_aes(&key_bytes, ciphertext)?;
        Ok(plaintext)
    }

    pub fn encrypt_data_for_users(
        &self,
        data: String,
        users: Vec<UserPublicKey>,
    ) -> Result<EncryptedDataWithAccess, Box<dyn Error>> {
        // Generate AES key
        let aes_key = generate_aes_key();

        // Encrypt data with AES key
        let encrypted_data = encrypt_with_aes(&aes_key, &data)?;

        // Encrypt AES key for each user
        let mut access_list = Vec::new();
        for user in users {
            let recipient = get_recipient(&user.public_key)?;
            let encrypted_key = encrypt_text_pgp(&recipient, &encode(aes_key.as_slice()))?;
            access_list.push(UserAccess {
                user_id: user.user_id,
                access: user.access,
                encrypted_key,
            });
        }

        Ok(EncryptedDataWithAccess {
            encrypted_data,
            access_list,
        })
    }
}

// Implement Default for CryptoUtils
impl Default for CryptoUtils {
    fn default() -> Self {
        Self::new()
    }
}
