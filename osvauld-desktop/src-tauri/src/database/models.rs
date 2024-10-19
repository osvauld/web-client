use crate::database::schema::*;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Insertable, Serialize, Deserialize, Debug, Clone)]
#[diesel(table_name = users)]
pub struct User {
    pub id: String,
    pub username: String,
    pub public_key: String,
}

#[derive(Queryable, Insertable, Serialize, Deserialize, Debug, Clone)]
#[diesel(table_name = folders)]
pub struct Folder {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub shared: bool,
    pub access_type: String,
}

#[derive(Queryable, Insertable, Associations, Serialize, Deserialize, Debug, Clone)]
#[diesel(belongs_to(Folder, foreign_key = folder_id))]
#[diesel(belongs_to(User, foreign_key = user_id))]
#[diesel(table_name = folder_access)]
pub struct FolderAccess {
    pub folder_id: String,
    pub user_id: String,
    pub access_type: String,
}

#[derive(Queryable, Insertable, Associations, Serialize, Deserialize, Debug, Clone)]
#[diesel(belongs_to(Folder, foreign_key = folder_id))]
#[diesel(table_name = credentials)]
pub struct Credential {
    pub id: String,
    pub credential_type: String,
    pub data: String,
    pub folder_id: String,
    pub signature: String,
    pub permission: String,
}

#[derive(Debug, Serialize, Deserialize, Queryable)]
pub struct FolderAccessWithPublicKey {
    pub user_id: String,
    pub access_type: String,
    pub public_key: String,
}

#[derive(Insertable)]
#[table_name = "credentials"]
pub struct NewCredential {
    pub id: String,
    pub credential_type: String,
    pub data: String,
    pub folder_id: String,
    pub signature: String,
    pub permission: String,
}

#[derive(Insertable)]
#[table_name = "credential_access"]
pub struct NewCredentialAccess {
    pub id: String,
    pub credential_id: String,
    pub user_id: String,
    pub access_type: String,
    pub folder_id: String,
    pub encrypted_key: String,
}

// Update your AddCredentialInput struct:
#[derive(Serialize, Deserialize, Debug)]
pub struct AddCredentialInput {
    pub folder_id: String,
    pub credential_payload: String,
    pub credential_type: String,
    pub signature: String,
    pub permission: String,
}

#[derive(Queryable, Serialize, Deserialize, Debug, Clone)]
pub struct CredentialWithEncryptedKey {
    pub id: String,
    pub credential_type: String,
    pub data: String,
    pub signature: String,
    pub permission: String,
    pub encrypted_key: String,
}
