use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PublicKey {
    pub id: String,
    pub public_key: String,
    pub access_type: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Field {
    pub field_name: Option<String>,
    pub field_value: String,
    pub field_type: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct EncryptedField {
    pub user_id: String,
    pub fields: Vec<Field>,
}

pub struct GeneratedKeys {
    pub private_key: String,
    pub public_key: String,
    pub salt: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MetaField {
    pub field_id: String,
    pub field_name: Option<String>,
    pub field_value: String,
    pub field_type: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Credential {
    pub credential_id: String,
    pub fields: Vec<MetaField>,
    pub name: String,
    pub description: String,
    pub folder_id: String,
    pub credential_type: String,
    pub created_at: String,
    pub created_by: String,
    pub updated_at: String,
    pub access_type: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BasicFields {
    pub field_id: String,
    pub field_value: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CredentialFields {
    pub credential_id: String,
    pub fields: Vec<BasicFields>,
}

#[derive(Debug, Serialize)]
pub struct EncryptedFieldValue {
    pub id: String,
    pub field_value: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UrlMap {
    pub value: String,
    pub credential_id: String,
}

#[derive(Serialize, Deserialize)]
pub struct PasswordChangeInput {
    pub old_password: String,
    pub new_password: String,
    pub enc_pvt_key: String,
    pub salt: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ShareCredsInput {
    pub credentials: Vec<CredentialFields>,
    pub selected_users: Vec<PublicKey>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CredentialsForUser {
    pub user_id: String,
    pub credentials: Vec<CredentialFields>,
    pub access_type: Option<String>,
}
