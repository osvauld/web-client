use log::{error, info};
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;
use surrealdb::engine::local::{Db, RocksDb};
use surrealdb::Surreal;
use tauri::Manager;
use tauri::Wry;
use tauri_plugin_store::StoreCollection;
use tokio::time::sleep;
pub type DbConnection = Arc<Surreal<Db>>;
pub mod handler;
mod service;
mod types;
use serde::{Deserialize, Serialize};
use surrealdb::sql::Thing;
#[derive(Debug, Serialize, Deserialize)]
struct TestRecord {
    id: Option<Thing>,
    name: String,
    value: i32,
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let handle = app.handle();
            let stores = handle.state::<StoreCollection<Wry>>();
            let path = PathBuf::from("my_app_store5.bin");

            // Initialize the store
            tauri_plugin_store::with_store(handle.clone(), stores, path, |store| store.save())
                .expect("failed to initialize store");
            let db_path = app.path().app_data_dir().unwrap().join("surrealdb");
            let rt = tokio::runtime::Runtime::new().expect("Failed to create Tokio runtime");

            let db: Result<Surreal<surrealdb::engine::local::Db>, String> = rt.block_on(async {
                let mut attempts = 0;
                const MAX_ATTEMPTS: u8 = 3;
                const RETRY_DELAY: Duration = Duration::from_secs(2);

                loop {
                    match Surreal::new::<RocksDb>(db_path.to_str().unwrap()).await {
                        Ok(db) => {
                            // Try to establish a connection
                            match db.health().await {
                                Ok(_) => {
                                    info!("Successfully connected to the database");
                                    return Ok(db);
                                }
                                Err(e) => {
                                    error!("Database health check failed: {}", e);
                                }
                            }
                        }
                        Err(e) => {
                            error!("Failed to create database instance: {}", e);
                        }
                    }

                    attempts += 1;
                    if attempts >= MAX_ATTEMPTS {
                        error!(
                            "Failed to connect to the database after {} attempts",
                            MAX_ATTEMPTS
                        );
                        return Err("Database connection failed".into());
                    }

                    info!(
                        "Retrying database connection in {} seconds...",
                        RETRY_DELAY.as_secs()
                    );
                    sleep(RETRY_DELAY).await;
                }
            });

            // Manage the database connection
            match db {
                Ok(connection) => {
                    let connection = Arc::new(connection);
                    app.manage(connection.clone());
                    info!("Database connection managed successfully");

                    let test_result1 = rt.block_on(async {
                        let conn = connection.clone();
                        let test_record = TestRecord {
                            id: None,
                            name: "Test Record 1".to_string(),
                            value: 42,
                        };

                        conn.use_ns("test_ns")
                            .use_db("test_db")
                            .await
                            .map_err(|e| {
                                format!("Failed to select namespace and database: {}", e)
                            })?;

                        match conn
                            .create::<Option<TestRecord>>("test_record")
                            .content(test_record)
                            .await
                        {
                            Ok(created) => {
                                if let Some(record) = created {
                                    info!("Successfully inserted test record 1: {:?}", record);
                                    Ok(())
                                } else {
                                    Err("Failed to retrieve inserted record 1".to_string())
                                }
                            }
                            Err(e) => Err(format!("Failed to insert test record 1: {}", e)),
                        }
                    });

                    let test_result2 = rt.block_on(async {
                        let conn = connection.clone();
                        let test_record = TestRecord {
                            id: None,
                            name: "Test Record 2".to_string(),
                            value: 43,
                        };

                        conn.use_ns("test_ns")
                            .use_db("test_db")
                            .await
                            .map_err(|e| {
                                format!("Failed to select namespace and database: {}", e)
                            })?;

                        match conn
                            .create::<Option<TestRecord>>("test_record")
                            .content(test_record)
                            .await
                        {
                            Ok(created) => {
                                if let Some(record) = created {
                                    info!("Successfully inserted test record 2: {:?}", record);
                                    Ok(())
                                } else {
                                    Err("Failed to retrieve inserted record 2".to_string())
                                }
                            }
                            Err(e) => Err(format!("Failed to insert test record 2: {}", e)),
                        }
                    });

                    match (test_result1, test_result2) {
                        (Ok(_), Ok(_)) => {
                            info!("Both database insert tests completed successfully")
                        }
                        (Err(e1), Ok(_)) => error!("First insert test failed: {}", e1),
                        (Ok(_), Err(e2)) => error!("Second insert test failed: {}", e2),
                        (Err(e1), Err(e2)) => error!("Both insert tests failed: {} and {}", e1, e2),
                    }
                }
                Err(e) => {
                    error!("Failed to establish database connection: {}", e);
                    panic!("Cannot continue without database connection");
                }
            }

            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![handler::handle_crypto_action])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
