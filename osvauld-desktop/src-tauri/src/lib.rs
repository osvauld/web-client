use log::{error, info};
use tauri::Manager;
use tauri_plugin_store::StoreExt;
mod database;
use database::{initialize_database, DbConnection};
pub mod handler;
mod p2p;
mod service;
use tokio::sync::Mutex;
mod types;
use log::LevelFilter;
use std::sync::Arc;
use tokio::runtime::Runtime;
use sys_locale::get_locale;

#[tauri::command]
fn get_system_locale() -> String {
    get_locale().unwrap_or_else(|| String::from("en-US"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(LevelFilter::Info)
                .filter(|metadata| {
                    !metadata.target().contains("tracing::span")
                        && !metadata.target().contains("iroh_net::magicsock")
                        && !metadata.target().contains("iroh_quinn_udp")
                        && !metadata.target().contains("iroh_net::relay")
                })
                .build(),
        )
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            log::info!("Setting up Tauri app");
            let handle = app.handle();
            let store = handle.store_builder("my_app_store8.bin").build().unwrap();
            store.save()?;
            app.manage(store);
            let app_dir = app.path().app_data_dir().unwrap();
            let db_path = app_dir.join("sqlite.db").to_str().unwrap().to_string();
            
            // Create a new Tokio runtime
            let rt = Arc::new(Runtime::new().expect("Failed to create Tokio runtime"));
            
            // Initialize database
            let rt_clone = Arc::clone(&rt);
            let db_connection: Result<DbConnection, String> = rt_clone.block_on(async {
                initialize_database(&db_path)
                    .await
                    .map_err(|e| format!("Failed to initialize database: {}", e))
            });
            
            match db_connection {
                Ok(connection) => {
                    app.manage(connection.clone());
                }
                Err(e) => {
                    error!("Failed to set up database: {}", e);
                    panic!("Cannot continue without database connection");
                }
            }
            
            let rt_clone = Arc::clone(&rt);
            match rt_clone.block_on(p2p::initialize_p2p(&handle)) {
                Ok(app_state) => {
                    info!("P2P initialization successful");
                    app.manage(app_state);
                }
                Err(e) => {
                    error!("Failed to initialize P2P: {}", e);
                    panic!("Cannot continue without P2P initialization");
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
        .invoke_handler(tauri::generate_handler![
            handler::handle_crypto_action,
            handler::get_ticket,
            handler::connect_with_ticket,
            handler::send_message,
            get_system_locale  // Added the new command

        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}