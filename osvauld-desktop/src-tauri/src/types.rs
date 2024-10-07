use crypto_utils::types::{
    CredentialsForUser, EncryptedField, EncryptedFieldValue, Field, PublicKey,
};
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
    ShareCredsPayload(Vec<CredentialsForUser>),
    DecryptedText(String),
    ImportedCertificate {
        certificate: String,
        publicKey: String,
        salt: String,
    },
    ChangedPassphrase(String),
    ExportedCertificate(String),
    EncryptedEditFields(Vec<EncryptedFieldValue>),
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

#[derive(Deserialize)]
pub struct ImportCertificateInput {
    pub certificate: String,
    pub passphrase: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]

pub struct PasswordChangeInput {
    pub old_password: String,
    pub new_password: String,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]

pub struct EncryptEditFieldsInput {
    pub field_value: String,
    pub users_to_share: Vec<PublicKey>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CredentialType {
    pub credential_id: String,
    pub credential_type: String,
    pub data: String,
    pub folder_id: String,
    pub signature: String,
    pub permission: String,
}
