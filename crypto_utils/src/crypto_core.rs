use crate::errors::{AesError, PgpError};
use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};

use anyhow::{Context, Result};
use argon2::Argon2;
use base64::{decode, encode};
use openpgp::{
    armor::{Kind::Signature, Writer as ArmorWriter},
    cert::{CertBuilder, CipherSuite},
    crypto::KeyPair,
    packet::{
        key::{PublicParts, SecretParts, UnspecifiedRole},
        Key,
    },
    parse::{
        stream::{MessageStructure, *},
        Parse,
    },
    policy::{Policy, StandardPolicy},
    serialize::{
        stream::{Message, *},
        Marshal,
    },
    types::{HashAlgorithm, KeyFlags, SymmetricAlgorithm},
    Cert,
};
use sequoia_openpgp::parse::stream::Decryptor;
use sequoia_openpgp::serialize::stream::Encryptor2;
use sequoia_openpgp::{self as openpgp};
use sequoia_openpgp::{cert::prelude::*, policy};
use std::error::Error;
use std::io::Write;
use std::io::{self};

pub fn generate_certificate(username: &str) -> Result<openpgp::Cert> {
    println!("Generating certificate for user: {}", username);

    let (cert, _revocation) = CertBuilder::new()
        .add_userid(username)
        .set_cipher_suite(CipherSuite::Cv25519)
        .add_subkey(KeyFlags::empty().set_signing(), None, None)
        .add_subkey(KeyFlags::empty().set_storage_encryption(), None, None)
        .generate()?;

    println!("Certificate generated. Fingerprint: {}", cert.fingerprint());

    Ok(cert)
}

pub fn derive_key(password: &str, salt: &[u8; 16]) -> Result<[u8; 32], AesError> {
    let mut output_key_material = [0u8; 32];
    Argon2::default()
        .hash_password_into(password.as_bytes(), salt, &mut output_key_material)
        .map_err(|e| AesError::KeyDerivationError(e.to_string()))?;
    Ok(output_key_material)
}

pub fn encrypt_certificate(
    data: &[u8],
    password: &str,
    salt: &[u8; 16],
) -> Result<String, Box<dyn Error>> {
    let key = derive_key(password, salt)?;
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| AesError::CipherCreationError(e.to_string()))?;

    let nonce = Nonce::from_slice(&salt[..12]);
    let encrypted_data = cipher
        .encrypt(nonce, data)
        .map_err(|e| AesError::EncryptionError(e.to_string()))?;

    Ok(encode(encrypted_data))
}

pub fn get_salt_arr(salt_b64: &str) -> Result<[u8; 16], Box<dyn Error>> {
    let salt = decode(salt_b64)?;

    if salt.len() != 16 {
        return Err("Invalid salt length".into());
    }

    salt.try_into()
        .map_err(|_| "Failed to convert salt to array".into())
}
pub fn decrypt_certificate(
    encrypted_cert_b64: &str,
    salt_b64: &str,
    password: &str,
) -> Result<Cert, AesError> {
    let encrypted_data =
        decode(encrypted_cert_b64).map_err(|e| AesError::Base64DecodeError(e.to_string()))?;

    let salt_array = get_salt_arr(salt_b64).unwrap();

    let key = derive_key(password, &salt_array)?;

    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| AesError::CipherCreationError(e.to_string()))?;

    let nonce = Nonce::from_slice(&salt_array[..12]);

    let decrypted_data = cipher
        .decrypt(nonce, encrypted_data.as_ref())
        .map_err(|e| AesError::DecryptionError(e.to_string()))?;

    let cert = Cert::from_bytes(&decrypted_data)
        .map_err(|e| AesError::CertificateParseError(e.to_string()))?;

    Ok(cert)
}

pub fn get_public_key_armored(cert: &openpgp::Cert) -> Result<String> {
    let mut buf = Vec::new();
    cert.armored().serialize(&mut buf)?;
    Ok(String::from_utf8(buf)?)
}

// pub fn encrypt_text(
//     recipients: &[&Key<PublicParts, UnspecifiedRole>],
//     text: &str,
// ) -> Result<String> {
//     // Perform the encryption
//     let mut encrypted = Vec::new();
//     {
//         let message = Message::new(&mut encrypted);
//         let message = Encryptor2::for_recipients(message, recipients)
//             .build()
//             .map_err(|e| PgpError::EncryptorCreationError(e.to_string()))?;
//         let mut writer = LiteralWriter::new(message)
//             .build()
//             .map_err(|e| PgpError::LiteralWriterCreationError(e.to_string()))?;
//         writer.write_all(text.as_bytes())?;
//         writer
//             .finalize()
//             .map_err(|e| PgpError::FinalizationError(e.to_string()))?;
//     }

//     // Armor the encrypted data
//     let mut armored = Vec::new();
//     {
//         let mut writer = openpgp::armor::Writer::new(&mut armored, openpgp::armor::Kind::Message)
//             .map_err(|e| PgpError::ArmorWriterCreationError(e.to_string()))?;
//         writer.write_all(&encrypted)?;
//         writer
//             .finalize()
//             .map_err(|e| PgpError::FinalizationError(e.to_string()))?;
//     }

//     Ok(String::from_utf8(armored)?)
// }

pub fn decrypt_message(
    policy: &dyn Policy,
    decrypt_key: &openpgp::packet::Key<SecretParts, UnspecifiedRole>,
    ciphertext: &[u8],
) -> Result<Vec<u8>, PgpError> {
    let helper = DecryptionHelperStruct {
        decrypt_key: decrypt_key.clone(),
    };

    let mut decryptor = DecryptorBuilder::from_bytes(ciphertext)
        .map_err(|e| PgpError::DecryptorCreationError(e.to_string()))?
        .with_policy(policy, None, helper)
        .map_err(|e| PgpError::PolicyApplicationError(e.to_string()))?;

    let mut plaintext = Vec::new();
    io::copy(&mut decryptor, &mut plaintext)
        .map_err(|e| PgpError::DecryptionError(e.to_string()))?;

    Ok(plaintext)
}

impl VerificationHelper for DecryptionHelperStruct {
    fn get_certs(
        &mut self,
        _ids: &[sequoia_openpgp::KeyHandle],
    ) -> Result<Vec<sequoia_openpgp::Cert>> {
        Ok(Vec::new())
    }

    fn check(&mut self, _structure: MessageStructure) -> Result<()> {
        Ok(())
    }
}
struct DecryptionHelperStruct {
    decrypt_key: openpgp::packet::Key<
        openpgp::packet::key::SecretParts,
        openpgp::packet::key::UnspecifiedRole,
    >,
}

impl DecryptionHelper for DecryptionHelperStruct {
    fn decrypt<D>(
        &mut self,
        pkesks: &[openpgp::packet::PKESK],
        _skesks: &[openpgp::packet::SKESK],
        sym_algo: Option<openpgp::types::SymmetricAlgorithm>,
        mut decrypt: D,
    ) -> openpgp::Result<Option<openpgp::Fingerprint>>
    where
        D: FnMut(openpgp::types::SymmetricAlgorithm, &openpgp::crypto::SessionKey) -> bool,
    {
        if pkesks.is_empty() {
            return Err(anyhow::anyhow!("No PKESKs provided"));
        }

        let mut pair = KeyPair::from(
            self.decrypt_key
                .clone()
                .into_keypair()
                .map_err(|e| PgpError::KeyPairCreationError(e.to_string()))?,
        );

        for pkesk in pkesks {
            if let Some((algo, session_key)) = pkesk.decrypt(&mut pair, sym_algo) {
                if decrypt(algo, &session_key) {
                    return Ok(Some(self.decrypt_key.fingerprint()));
                }
            }
        }

        // If we've reached this point, decryption failed for all PKESKs
        Err(anyhow::anyhow!("Decryption failed for all provided PKESKs"))
    }
}
pub fn hash_text_sha512(text: &str) -> Result<Vec<u8>, PgpError> {
    let mut ctx = HashAlgorithm::SHA512
        .context()
        .map_err(|e| PgpError::HashContextCreationError(e.to_string()))?;

    ctx.update(text.as_bytes());

    let mut digest = vec![0; ctx.digest_size()];
    ctx.digest(&mut digest)
        .map_err(|e| PgpError::DigestComputationError(e.to_string()))?;

    Ok(digest)
}

// pub fn get_recipient(public_key: &str) -> Result<(Recipient, Key<PublicParts, UnspecifiedRole>)> {
//     let cert = Cert::from_bytes(public_key.as_bytes())?;
//     let policy = &StandardPolicy::new();

//     cert.keys()
//         .with_policy(policy, None)
//         .supported()
//         .alive()
//         .revoked(false)
//         .for_storage_encryption()
//         .next()
//         .map(|ka| {
//             let key = ka.key().clone();
//             let keyid = key.keyid();
//             let recipient = Recipient::new(keyid, &key);
//             (recipient, key)
//         })
//         .ok_or_else(|| anyhow::anyhow!("No suitable encryption key found"))
// }

pub fn encrypt_for_multiple_recipients(
    message: &str,
    public_keys: &[String],
) -> Result<String, Box<dyn std::error::Error>> {
    // Create a vector to store the encryption keys
    let mut encryption_keys = Vec::new();

    // Convert each public key string into an encryption key
    for public_key in public_keys {
        let cert = Cert::from_bytes(public_key.as_bytes())?;
        let policy = &StandardPolicy::new();

        let key = cert
            .keys()
            .with_policy(policy, None)
            .supported()
            .alive()
            .revoked(false)
            .for_storage_encryption()
            .next()
            .ok_or_else(|| anyhow::anyhow!("No suitable encryption key found"))?;

        // Clone the key to own it
        let owned_key = key.key().clone();
        encryption_keys.push(owned_key);
    }

    // Create recipients from the owned keys
    let recipients: Vec<_> = encryption_keys.iter().map(Recipient::from).collect();

    // Perform the encryption
    let mut encrypted = Vec::new();
    {
        let message_writer = Message::new(&mut encrypted);
        let message_encryptor = Encryptor2::for_recipients(message_writer, recipients)
            .symmetric_algo(SymmetricAlgorithm::AES256)
            .build()?;

        let mut literal_writer = LiteralWriter::new(message_encryptor).build()?;
        literal_writer.write_all(message.as_bytes())?;
        literal_writer.finalize()?;
    }

    // Armor the encrypted data
    let mut armored = Vec::new();
    {
        let mut writer = openpgp::armor::Writer::new(&mut armored, openpgp::armor::Kind::Message)?;
        writer.write_all(&encrypted)?;
        writer.finalize()?;
    }

    // Convert the armored data to a string
    Ok(String::from_utf8(armored)?)
}

pub fn get_signing_keypair(cert: &Cert) -> Result<KeyPair, PgpError> {
    let policy = &StandardPolicy::new();
    let signing_key = cert
        .keys()
        .with_policy(policy, None)
        .for_signing()
        .unencrypted_secret()
        .next()
        .ok_or(PgpError::NoSuitableSigningKeyError)?;

    signing_key
        .key()
        .clone()
        .into_keypair()
        .map_err(|e| PgpError::KeyPairCreationError(e.to_string()))
}

pub fn get_decryption_key(
    cert: &Cert,
) -> Result<openpgp::packet::Key<SecretParts, UnspecifiedRole>, PgpError> {
    let policy = &StandardPolicy::new();

    cert.keys()
        .unencrypted_secret()
        .with_policy(policy, None)
        .supported()
        .alive()
        .revoked(false)
        .for_storage_encryption()
        .next()
        .map(|key| key.key().clone())
        .ok_or(PgpError::NoSuitableDecryptionKeyError)
}

pub fn sign_message(keypair: &KeyPair, message: &str) -> Result<Vec<u8>, PgpError> {
    let mut signature = Vec::new();
    {
        let message_writer = Message::new(&mut signature);
        let mut signer = Signer::new(message_writer, keypair.clone())
            .detached()
            .build()
            .map_err(|e| PgpError::SignerCreationError(e.to_string()))?;
        signer
            .write_all(message.as_bytes())
            .map_err(|e| PgpError::MessageWriteError(e.to_string()))?;
        signer
            .finalize()
            .map_err(|e| PgpError::SignatureFinalizationError(e.to_string()))?;
    }

    let mut armored_signature = Vec::new();
    {
        let mut armor_writer = ArmorWriter::new(&mut armored_signature, Signature)
            .map_err(|e| PgpError::ArmorWriterCreationError(e.to_string()))?;
        armor_writer
            .write_all(&signature)
            .map_err(|e| PgpError::SignatureWriteError(e.to_string()))?;
        armor_writer
            .finalize()
            .map_err(|e| PgpError::ArmorFinalizationError(e.to_string()))?;
    }

    Ok(armored_signature)
}

// pub fn encrypt_for_multiple_recipients(plaintext: &str, public_keys: &[&str]) -> Result<Vec<u8>> {
//     let policy = &StandardPolicy::new();

//     let recipients: Vec<Cert> = public_keys
//         .iter()
//         .map(|&key| Cert::from_bytes(key.as_bytes()))
//         .collect::<Result<Vec<Cert>>>()?;

//     let recipient_keys: Vec<Key<PublicParts, UnspecifiedRole>> = recipients
//         .iter()
//         .filter_map(|cert| {
//             cert.keys()
//                 .with_policy(policy, None)
//                 .for_storage_encryption()
//                 .next()
//                 .map(|ka| ka.key().clone())
//         })
//         .collect();

//     let mut encrypted = Vec::new();
//     {
//         let message = Message::new(&mut encrypted);
//         let message = Encryptor2::for_recipients(message, &recipient_keys).build()?;
//         let mut writer = LiteralWriter::new(message).build()?;
//         writer.write_all(plaintext.as_bytes())?;
//         writer.finalize()?;
//     }

//     Ok(encrypted)
// }

// pub fn decrypt_multi_recipient_message(cert: &Cert, encrypted: &[u8]) -> Result<String> {
//     let policy = &StandardPolicy::new();
//     let decrypt_key = cert
//         .keys()
//         .unencrypted_secret()
//         .with_policy(policy, None)
//         .for_storage_encryption()
//         .next()
//         .context("No suitable decryption key found")?
//         .key()
//         .clone();

//     let helper = DecryptionHelperStruct { decrypt_key };

//     let mut decrypted = Vec::new();
//     let mut decryptor =
//         DecryptorBuilder::from_bytes(encrypted)?.with_policy(policy, None, helper)?;
//     std::io::copy(&mut decryptor, &mut decrypted)?;
//     String::from_utf8(decrypted).context("Failed to convert decrypted data to UTF-8")
// }
