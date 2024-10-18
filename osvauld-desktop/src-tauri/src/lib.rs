use log::{error, info};
use tauri::Manager;
use tauri_plugin_store::StoreExt;
mod database;
use database::{initialize_database, DbConnection};
pub mod handler;

mod server;
mod service;
mod types;
use log::LevelFilter;
use std::sync::Arc;
use tokio::runtime::Runtime;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(LevelFilter::Info) // Set the general log level
                .filter(|metadata| {
                    !metadata.target().starts_with("surrealdb") // Filter out SurrealDB logs
                })
                .build(),
        )
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let handle = app.handle();
            let store = handle.store_builder("my_app_store8.bin").build();
            store.save()?;
            app.manage(store);

            let app_dir = app.path().app_data_dir().unwrap();
            let db_path = app_dir.join("sqlite.db").to_str().unwrap().to_string();

            // Create a new Tokio runtime
            let rt = Arc::new(Runtime::new().expect("Failed to create Tokio runtime"));

            // Clone the Arc<Runtime> for use in the database setup
            let rt_clone = Arc::clone(&rt);
            let db_connection: Result<DbConnection, String> = rt_clone.block_on(async {
                initialize_database(&db_path)
                    .await
                    .map_err(|e| format!("Failed to initialize database: {}", e))
            });

            match db_connection {
                Ok(connection) => {
                    app.manage(connection.clone());

                    // Start the HTTP/2 server
                    let server_connection = connection.clone();
                    let rt_clone = Arc::clone(&rt);
                    std::thread::spawn(move || {
                        rt_clone.block_on(async {
                            if let Err(e) = server::run_server(server_connection).await {
                                error!("Local HTTP/2 server error: {}", e);
                            }
                        });
                    });
                }
                Err(e) => {
                    error!("Failed to set up database: {}", e);
                    panic!("Cannot continue without database connection");
                }
            }

            // Manage the runtime
            app.manage(rt);

            #[cfg(debug_assertions)]
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
