mod crypto_core;
mod errors;
pub mod types;

use crate::crypto_core::{
    decrypt_certificate, encrypt_certificate, generate_certificate, get_decryption_key,
    get_public_key_armored, get_salt_arr, get_signing_keypair, hash_text_sha512, sign_message,
};
use crate::errors::CryptoUtilsError;
pub use crate::types::{
    BasicFields, Credential, CredentialFields, CredentialsForUser, EncryptedField,
    EncryptedFieldValue, Field, GeneratedKeys, MetaField, PublicKey, ShareCredsInput, UrlMap,
};
use anyhow::{Error as AnyhowError, Result};
use argon2::password_hash::rand_core::OsRng;
use base64::encode;
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

    // pub fn encrypt_fields_for_multiple_keys(
    //     &self,
    //     public_keys: Vec<PublicKey>,
    //     fields: Vec<Field>,
    // ) -> Result<Vec<EncryptedField>, Box<dyn std::error::Error>> {
    //     let mut encrypted_fields = Vec::new();
    //     for public_key in public_keys {
    //         let recipient = get_recipient(&public_key.public_key)?;
    //         let mut fields_for_user = Vec::new();
    //         for field in &fields {
    //             let encrypted_value = encrypt_text(&recipient, &field.field_value)?;
    //             fields_for_user.push(Field {
    //                 field_name: field.field_name.clone(),
    //                 field_value: encrypted_value,
    //                 field_type: field.field_type.clone(),
    //             });
    //         }

    //         encrypted_fields.push(EncryptedField {
    //             user_id: public_key.id,
    //             fields: fields_for_user,
    //         });
    //     }
    //     Ok(encrypted_fields)
    // }

    // pub fn decrypt_credentials(
    //     &self,
    //     credentials: Vec<Credential>,
    // ) -> Result<Vec<Credential>, Box<dyn Error>> {
    //     let cert = self
    //         .cert
    //         .as_ref()
    //         .ok_or(CryptoUtilsError::NoCertificateError)?;
    //     let decrypt_key = get_decryption_key(cert)?;
    //     let mut decrypted_credentials = Vec::new();
    //     let policy = StandardPolicy::new();

    //     for credential in credentials {
    //         let mut decrypted_fields = Vec::new();

    //         for field in &credential.fields {
    //             let decrypted_bytes =
    //                 decrypt_message(&policy, &decrypt_key, field.field_value.as_bytes())?;
    //             let decrypted_text = String::from_utf8(decrypted_bytes)?;
    //             decrypted_fields.push(MetaField {
    //                 field_id: field.field_id.clone(),
    //                 field_name: field.field_name.clone(),
    //                 field_value: decrypted_text,
    //                 field_type: field.field_type.clone(),
    //             });
    //         }

    //         let decrypted_credential = Credential {
    //             credential_id: credential.credential_id,
    //             fields: decrypted_fields,
    //             name: credential.name,
    //             description: credential.description,
    //             folder_id: credential.folder_id,
    //             credential_type: credential.credential_type,
    //             created_at: credential.created_at,
    //             created_by: credential.created_by,
    //             updated_at: credential.updated_at,
    //             access_type: credential.access_type,
    //         };

    //         decrypted_credentials.push(decrypted_credential);
    //     }

    //     Ok(decrypted_credentials)
    // }

    // pub fn decrypt_text(&self, encrypted_text: String) -> Result<String, Box<dyn Error>> {
    //     let cert = self
    //         .cert
    //         .as_ref()
    //         .ok_or(CryptoUtilsError::NoCertificateError)?;
    //     let policy = &StandardPolicy::new();
    //     let decrypt_key = get_decryption_key(cert)?;
    //     let decrypted_bytes = decrypt_message(policy, &decrypt_key, encrypted_text.as_bytes())?;
    //     let decrypted_text = String::from_utf8(decrypted_bytes)?;
    //     Ok(decrypted_text)
    // }

    // pub fn decrypt_fields(
    //     &self,
    //     credentials: Vec<CredentialFields>,
    // ) -> Result<Vec<CredentialFields>, Box<dyn Error>> {
    //     let cert = self
    //         .cert
    //         .as_ref()
    //         .ok_or(CryptoUtilsError::NoCertificateError)?;
    //     let policy = &StandardPolicy::new();
    //     let decrypt_key = get_decryption_key(cert)?;
    //     let mut decrypted_credentials = Vec::new();

    //     for credential in credentials {
    //         let mut decrypted_fields = Vec::new();

    //         for field in credential.fields {
    //             let decrypted_bytes =
    //                 match decrypt_message(policy, &decrypt_key, field.field_value.as_bytes()) {
    //                     Ok(bytes) => bytes,
    //                     Err(_) => continue,
    //                 };

    //             let decrypted_text = match String::from_utf8(decrypted_bytes) {
    //                 Ok(text) => text,
    //                 Err(_) => continue,
    //             };

    //             decrypted_fields.push(BasicFields {
    //                 field_id: field.field_id,
    //                 field_value: decrypted_text,
    //             });
    //         }

    //         decrypted_credentials.push(CredentialFields {
    //             credential_id: credential.credential_id,
    //             fields: decrypted_fields,
    //         });
    //     }

    //     Ok(decrypted_credentials)
    // }

    // pub fn encrypt_fields(
    //     &self,
    //     fields: Vec<BasicFields>,
    //     public_key: &str,
    // ) -> Result<Vec<BasicFields>> {
    //     let recipient_key = get_recipient(public_key)?;
    //     let mut encrypted_fields = Vec::new();

    //     for field in fields {
    //         let encrypted_value = encrypt_text(&recipient_key, &field.field_value)?;
    //         encrypted_fields.push(BasicFields {
    //             field_id: field.field_id,
    //             field_value: encrypted_value,
    //         });
    //     }

    //     Ok(encrypted_fields)
    // }

    pub fn sign_and_hash_message(&self, message: &str) -> Result<String, Box<dyn Error>> {
        let hash_text = hash_text_sha512(message)?;
        let hash_base64 = encode(&hash_text);
        let signature = self.sign_message(&hash_base64)?;
        Ok(signature)
    }

    // pub fn encrypt_field_value(
    //     &self,
    //     field_value: &str,
    //     public_keys: Vec<PublicKey>,
    // ) -> Result<Vec<EncryptedFieldValue>, Box<dyn Error>> {
    //     let mut results = Vec::new();
    //     for public_key in public_keys {
    //         let recipient = get_recipient(&public_key.public_key)?;
    //         let encrypted_text = encrypt_text(&recipient, field_value)?;
    //         results.push(EncryptedFieldValue {
    //             id: public_key.id,
    //             field_value: encrypted_text,
    //         })
    //     }
    //     Ok(results)
    // }

    // pub fn decrypt_urls(&self, url_map: Vec<UrlMap>) -> Result<Vec<UrlMap>, Box<dyn Error>> {
    //     let mut results = Vec::new();
    //     for url in url_map {
    //         let decrypted_url = self.decrypt_text(url.value)?;
    //         results.push(UrlMap {
    //             value: decrypted_url,
    //             credential_id: url.credential_id,
    //         })
    //     }
    //     Ok(results)
    // }
    pub fn encrypt_for_multiple_recipients(
        &self,
        message: &str,
        public_keys: &[String],
    ) -> Result<String, Box<dyn std::error::Error>> {
        crypto_core::encrypt_for_multiple_recipients(message, public_keys)
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

    // pub fn create_share_creds_payload(
    //     &self,
    //     input: ShareCredsInput,
    // ) -> Result<Vec<CredentialsForUser>, Box<dyn Error>> {
    //     let decrypted_fields = self.decrypt_fields(input.credentials)?;
    //     let mut user_data = Vec::new();

    //     for user in input.selected_users {
    //         let user_encrypted_fields =
    //             self.encrypt_fields_for_user(&decrypted_fields, &user.public_key)?;
    //         user_data.push(CredentialsForUser {
    //             user_id: user.id,
    //             credentials: user_encrypted_fields,
    //             access_type: user.access_type,
    //         });
    //     }

    //     Ok(user_data)
    // }

    // fn encrypt_fields_for_user(
    //     &self,
    //     credentials: &[CredentialFields],
    //     public_key: &str,
    // ) -> Result<Vec<CredentialFields>, Box<dyn Error>> {
    //     let mut encrypted_creds = Vec::new();
    //     for credential in credentials {
    //         let encrypted_fields = self.encrypt_fields(credential.fields.clone(), public_key)?;
    //         encrypted_creds.push(CredentialFields {
    //             credential_id: credential.credential_id.clone(),
    //             fields: encrypted_fields,
    //         });
    //     }
    //     Ok(encrypted_creds)
    // }
    // pub fn multi_recipient_encryption_poc() -> Result<()> {
    //     // Generate two certificates
    //     println!("Generating two certificates...");
    //     let cert1 = generate_certificate("user1")?;
    //     let cert2 = generate_certificate("user2")?;
    //     println!("Certificates generated.");

    //     // Get public keys from certificates
    //     let public_key1 = get_public_key_armored(&cert1)?;
    //     let public_key2 = get_public_key_armored(&cert2)?;

    //     // Static plaintext
    //     let plaintext = "This is a secret message for multiple recipients.";
    //     println!("Original plaintext: {}", plaintext);

    //     // Encrypt for both recipients
    //     println!("Encrypting for both recipients...");
    //     let encrypted = encrypt_for_multiple_recipients(plaintext, &[&public_key1, &public_key2])?;
    //     println!("Encryption complete.");

    //     // Decrypt with first certificate
    //     println!("Decrypting with first certificate...");
    //     let decrypted1 = decrypt_multi_recipient_message(&cert1, &encrypted)?;
    //     println!("Decrypted with cert1: {}", decrypted1);

    //     // Decrypt with second certificate
    //     println!("Decrypting with second certificate...");
    //     let decrypted2 = decrypt_multi_recipient_message(&cert2, &encrypted)?;
    //     println!("Decrypted with cert2: {}", decrypted2);

    //     // Verify results
    //     assert_eq!(plaintext, decrypted1);
    //     assert_eq!(plaintext, decrypted2);
    //     println!("Assertion passed: Both decrypted texts match the original!");

    //     Ok(())
    // }
}

// Implement Default for CryptoUtils
impl Default for CryptoUtils {
    fn default() -> Self {
        Self::new()
    }
}
