use log::{error, info, LevelFilter};
use std::time::Duration;
use surrealdb::engine::local::{Db, RocksDb};
use surrealdb::Surreal;
use tokio::time::sleep;

pub async fn connect_database(db_path: &str) -> Result<Surreal<Db>, String> {
    let mut attempts = 0;
    const MAX_ATTEMPTS: u8 = 3;
    const RETRY_DELAY: Duration = Duration::from_secs(2);

    loop {
        match Surreal::new::<RocksDb>(db_path).await {
            Ok(db) => match db.health().await {
                Ok(_) => {
                    info!("Successfully connected to the database");
                    return Ok(db);
                }
                Err(e) => {
                    error!("Database health check failed: {}", e);
                }
            },
            Err(e) => {
                error!("Failed to create database instance: {}", e);
            }
        }
        attempts += 1;
        if attempts >= MAX_ATTEMPTS {
            return Err("Database connection failed after multiple attempts".into());
        }
        sleep(RETRY_DELAY).await;
    }
}

pub async fn initialize_database(db: &Surreal<Db>) -> Result<(), String> {
    // Set up namespace and database
    db.use_ns("myapp")
        .use_db("mydb")
        .await
        .map_err(|e| format!("Failed to select namespace and database: {}", e))?;

    // Create credential table without enforcing schema
    create_table(db, "credential").await?;

    // Create index for better query performance
    create_index(db, "credential", "credential_id").await?;

    info!("Database initialized successfully");
    Ok(())
}

async fn create_table(db: &Surreal<Db>, table_name: &str) -> Result<(), String> {
    db.query(format!("DEFINE TABLE {} SCHEMALESS", table_name))
        .await
        .map_err(|e| format!("Failed to create table {}: {}", table_name, e))?;
    Ok(())
}

async fn create_index(db: &Surreal<Db>, table_name: &str, field_name: &str) -> Result<(), String> {
    db.query(format!(
        "DEFINE INDEX idx_{}_{}  ON TABLE {} FIELDS {}",
        table_name, field_name, table_name, field_name
    ))
    .await
    .map_err(|e| {
        format!(
            "Failed to create index on {}.{}: {}",
            table_name, field_name, e
        )
    })?;
    Ok(())
}

pub async fn init(db_path: &str) -> Result<Surreal<Db>, String> {
    let db = connect_database(db_path).await?;
    initialize_database(&db).await?;
    Ok(db)
}
