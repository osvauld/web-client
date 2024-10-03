use log::{error, info};
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
    // Here you would set up your database schema, create necessary tables, indexes, etc.
    // For now, we'll just use a default namespace and database
    db.use_ns("myapp")
        .use_db("mydb")
        .await
        .map_err(|e| format!("Failed to select namespace and database: {}", e))?;

    info!("Database initialized successfully");
    Ok(())
}
