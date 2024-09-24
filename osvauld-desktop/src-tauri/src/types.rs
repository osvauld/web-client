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
