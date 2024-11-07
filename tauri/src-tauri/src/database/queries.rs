use crate::database::models::{
    Credential, CredentialWithEncryptedKey, Folder, FolderAccessWithPublicKey, NewCredential,
    SyncRecord, User,
};
use crate::database::schema::{credentials, folders, sync_records, users};
use crate::DbConnection;
use crypto_utils::types::UserAccess;
use diesel::prelude::*;
use diesel::result::Error;
use log::{error, info};
use uuid::Uuid;

pub fn insert_folder(conn: &mut SqliteConnection, folder: &Folder) -> Result<(), Error> {
    match diesel::insert_into(folders::table)
        .values(folder)
        .execute(conn)
    {
        Ok(_) => {
            info!("Folder inserted");
            Ok(())
        }
        Err(e) => {
            error!("Error inserting folder: {:?}", e);
            Err(e)
        }
    }
}

pub fn insert_sync_records(
    conn: &mut SqliteConnection,
    sync_records: &[SyncRecord],
) -> Result<(), Error> {
    match diesel::insert_into(sync_records::table)
        .values(sync_records)
        .execute(conn)
    {
        Ok(_) => {
            info!("Sync records inserted");
            Ok(())
        }
        Err(e) => {
            error!("Error inserting sync records: {:?}", e);
            Err(e)
        }
    }
}

pub async fn insert_folder_with_sync(
    conn: &mut SqliteConnection,
    folder: &Folder,
    sync_records: &[SyncRecord],
) -> Result<(), Error> {
    conn.transaction(|conn| {
        insert_folder(conn, folder)?;
        insert_sync_records(conn, sync_records)?;
        info!("Transaction completed successfully");
        Ok(())
    })
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

fn insert_credential(
    conn: &mut SqliteConnection,
    encrypted_payload: &str,
    folder_id: &str,
) -> Result<String, Error> {
    let credential_id = Uuid::new_v4().to_string();
    let new_credential = NewCredential {
        id: credential_id.clone(),
        data: encrypted_payload.to_string(),
        folder_id: folder_id.to_string(),
        permission: "read".to_string(),
        signature: "signature".to_string(),
        credential_type: "credential_type".to_string(),
    };

    match diesel::insert_into(credentials::table)
        .values(&new_credential)
        .execute(conn)
    {
        Ok(_) => {
            info!("Credential inserted with id: {}", credential_id);
            Ok(credential_id)
        }
        Err(e) => {
            error!("Error inserting credential: {:?}", e);
            Err(e)
        }
    }
}
fn insert_sync_record(conn: &mut SqliteConnection, credential_id: &str) -> Result<(), Error> {
    let sync_record = SyncRecord {
        id: Uuid::new_v4().to_string(),
        resource_type: "credential".to_string(),
        resource_id: credential_id.to_string(),
        status: "pending".to_string(),
        operation_type: "create".to_string(),
        source_device_id: "1".to_string(),
        target_device_id: "2".to_string(),
        created_at: "test".to_string(),
        updated_at: "test".to_string(),
        folder_id: None,
        credential_id: Some(credential_id.to_string()),
    };

    diesel::insert_into(sync_records::table)
        .values(&sync_record)
        .execute(conn)
        .map(|_| ())
        .map_err(|e| {
            error!("Error inserting sync record: {:?}", e);
            e
        })
}

pub async fn add_credential_and_access(
    db: &DbConnection,
    encrypted_payload: String,
    folder_id: String,
) -> Result<(), Error> {
    let mut conn = db.lock().await;

    conn.transaction(|conn| {
        // Insert credential and get its ID
        let credential_id = insert_credential(conn, &encrypted_payload, &folder_id)?;

        // Insert sync record
        insert_sync_record(conn, &credential_id)?;

        info!("All operations completed successfully in transaction");
        Ok(())
    })
}

pub async fn get_credentials_with_encrypted_key(
    conn: &DbConnection,
    folder_id: String,
) -> Result<Vec<CredentialWithEncryptedKey>, Error> {
    let mut conn = conn.lock().await;

    credentials::table
        .filter(credentials::folder_id.eq(folder_id))
        .load::<CredentialWithEncryptedKey>(&mut *conn)
}
