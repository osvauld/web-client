pub mod init;
pub mod queries;

use log::{error, info};
use std::sync::Arc;
use surrealdb::engine::local::Db;
use surrealdb::Surreal;

pub type DbConnection = Arc<Surreal<Db>>;

pub async fn setup_database(db_path: &str) -> Result<DbConnection, String> {
    info!("Starting database setup...");
    let db = init::connect_database(db_path).await?;
    let connection = Arc::new(db);
    info!("Database connection established. Initializing database...");
    init::initialize_database(&connection).await?;
    info!("Database initialized successfully.");
    Ok(connection)
}
