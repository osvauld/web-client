use log::{error, info};
use std::path::PathBuf;
use tauri::Manager;
use tauri::Wry;
use tauri_plugin_store::StoreCollection;
mod database;
use database::{setup_database, DbConnection};
pub mod handler;
mod service;
mod types;
use std::sync::Arc;
// #[tauri::mobile_entry_point]
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

            let db_connection: Result<DbConnection, String> =
                rt.block_on(async { setup_database(db_path.to_str().unwrap()).await });
            match db_connection {
                Ok(connection) => {
                    app.manage(connection);
                    app.manage(Arc::new(rt));
                }
                Err(e) => {
                    error!("Failed to set up database: {}", e);
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
