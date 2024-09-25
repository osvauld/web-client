use crypto_utils::types::{EncryptedField, Field, PublicKey};
use crypto_utils::Credential;
use serde::{Deserialize, Serialize};
#[derive(Serialize)]
#[serde(untagged)]
pub enum CryptoResponse {
    IsSignedUp {
        isSignedUp: bool,
    },
    Error(String),
    SavePassphrase {
        signature: String,
        username: String,
        deviceKey: String,
        encryptionKey: String,
    },
    CheckPvtKeyLoaded(bool),
    PublicKey(String),
    Signature(String),
    EncryptedCredential(Vec<EncryptedField>),
    SignatureResponse {
        signature: String,
    },
    DecryptedCredentials(Vec<Credential>),
}

#[derive(Deserialize)]
pub struct SavePassphraseInput {
    pub username: String,
    pub passphrase: String,
    pub challenge: String,
}

#[derive(Deserialize)]
pub struct LoadPvtKeyInput {
    pub passphrase: String,
}

#[derive(Deserialize)]
pub struct SignChallengeInput {
    pub challenge: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]

pub struct AddCredentialInput {
    pub users: Vec<PublicKey>,
    pub add_credential_fields: Vec<Field>,
}

#[derive(Deserialize)]
pub struct HashAndSignInput {
    pub message: String,
}

#[derive(Deserialize)]
pub struct DecryptMetaInput {
    pub credentials: Vec<Credential>,
}
