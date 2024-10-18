use serde::{Deserialize, Serialize};

pub struct GeneratedKeys {
    pub private_key: String,
    pub public_key: String,
    pub salt: String,
}

#[derive(Serialize, Deserialize)]
pub struct PasswordChangeInput {
    pub old_password: String,
    pub new_password: String,
    pub enc_pvt_key: String,
    pub salt: String,
}

#[derive(Serialize, Deserialize, Debug)]

pub struct UserPublicKey {
    pub user_id: String,
    pub public_key: String,
    pub access: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UserAccess {
    pub user_id: String,
    pub access: String,
    pub encrypted_key: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct EncryptedDataWithAccess {
    pub encrypted_data: String,
    pub access_list: Vec<UserAccess>,
}
