use crate::database::models::{
    Credential, Folder, FolderAccess, FolderAccessWithPublicKey, NewCredential,
    NewCredentialAccess, User,
};
use crate::database::schema::{credential_access, credentials, folder_access, folders, users};
use crate::DbConnection;
use crypto_utils::types::UserAccess;
use diesel::prelude::*;
use diesel::result::Error;
use uuid::Uuid;

pub async fn add_folder(
    conn: &DbConnection,
    name: String,
    description: Option<String>,
    shared: bool,
    access_type: String,
) -> Result<Folder, Error> {
    let new_folder = Folder {
        id: Uuid::new_v4().to_string(),
        name,
        description,
        shared,
        access_type,
    };

    let mut conn = conn.lock().await;
    diesel::insert_into(folders::table)
        .values(&new_folder)
        .execute(&mut *conn)?;

    Ok(new_folder)
}

pub async fn add_folder_access(
    conn: &DbConnection,
    folder_id: String,
    user_id: String,
    access_type: String,
) -> Result<(), Error> {
    let new_access = FolderAccess {
        folder_id,
        user_id,
        access_type,
    };

    let mut conn = conn.lock().await;
    diesel::insert_into(folder_access::table)
        .values(&new_access)
        .execute(&mut *conn)?;

    Ok(())
}

pub async fn get_all_folders(conn: &DbConnection) -> Result<Vec<Folder>, Error> {
    let mut conn = conn.lock().await;
    folders::table.load::<Folder>(&mut *conn)
}

pub async fn add_user(
    conn: &DbConnection,
    username: String,
    public_key: String,
) -> Result<String, Error> {
    let new_user = User {
        id: Uuid::new_v4().to_string(),
        username,
        public_key,
    };

    let mut conn = conn.lock().await;
    diesel::insert_into(users::table)
        .values(&new_user)
        .execute(&mut *conn)?;

    Ok(new_user.id)
}

pub async fn get_folder_access(
    conn: &DbConnection,
    folder_id: String,
) -> Result<Vec<FolderAccessWithPublicKey>, Error> {
    let mut conn = conn.lock().await;
    folder_access::table
        .inner_join(users::table)
        .filter(folder_access::folder_id.eq(folder_id))
        .select((
            folder_access::user_id,
            folder_access::access_type,
            users::public_key,
        ))
        .load::<FolderAccessWithPublicKey>(&mut *conn)
}

pub async fn add_credential_and_access(
    db: &DbConnection,
    encrypted_payload: String,
    folder_id: String,
    user_access_list: Vec<UserAccess>,
) -> Result<(), diesel::result::Error> {
    let mut conn = db.lock().await;

    conn.transaction(|conn| {
        let credential_id = Uuid::new_v4().to_string();

        // Insert the credential
        let new_credential = NewCredential {
            id: credential_id.clone(),
            data: encrypted_payload,
            folder_id: folder_id.clone(),
            permission: "read".to_string(),
            signature: "signature".to_string(),
            credential_type: "credential_type".to_string(),
        };

        diesel::insert_into(credentials::table)
            .values(&new_credential)
            .execute(conn)?;

        // Insert credential access entries
        let credential_access_entries: Vec<NewCredentialAccess> = user_access_list
            .into_iter()
            .map(|access| NewCredentialAccess {
                id: Uuid::new_v4().to_string(),
                credential_id: credential_id.clone(),
                user_id: access.user_id,
                access_type: access.access,
                folder_id: folder_id.clone(),
                encrypted_key: access.encrypted_key,
            })
            .collect();

        diesel::insert_into(credential_access::table)
            .values(&credential_access_entries)
            .execute(conn)?;

        Ok(())
    })
}
