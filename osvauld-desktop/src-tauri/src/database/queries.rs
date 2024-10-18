use crate::database::models::{Credential, Folder, FolderAccess, FolderAccessWithPublicKey, User};
use crate::database::schema::{credentials, folder_access, folders, users};
use crate::DbConnection;
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

pub async fn add_credential(
    conn: &DbConnection,
    credential_type: String,
    data: String,
    folder_id: String,
    signature: String,
    permission: String,
) -> Result<Credential, Error> {
    let new_credential = Credential {
        id: Uuid::new_v4().to_string(),
        credential_type,
        data,
        folder_id,
        signature,
        permission,
    };

    let mut conn = conn.lock().await;
    diesel::insert_into(credentials::table)
        .values(&new_credential)
        .execute(&mut *conn)?;

    Ok(new_credential)
}
