use log::{error, info};
use tauri::Manager;
pub mod application;
mod database;
pub mod domains;
pub mod persistence;
use database::{initialize_database, DbConnection};
pub mod handler;
pub mod handlers;
mod p2p;
mod service;
mod types;
use crate::application::services::AuthService;
use crate::application::services::CredentialService;
use crate::application::services::FolderService;
use crate::handler::{connect_with_ticket, get_system_locale, get_ticket, send_message};
use crate::handlers::auth_handler::{
    check_private_key_loaded, check_signup_status, handle_change_passphrase,
    handle_export_certificate, handle_get_public_key, handle_hash_and_sign,
    handle_import_certificate, handle_save_passphrase, handle_sign_challenge,
};
use crate::handlers::credential_handler::{
    handle_add_credential, handle_get_credentials_for_folder,
};
use crate::handlers::folder_handler::{handle_add_folder, handle_get_folders};
use crate::persistence::repositories::{
    SqliteCredentialRepository, SqliteFolderRepository, SqliteSyncRepository,
    TauriStoreAuthRepository,
};
use crypto_utils::CryptoUtils;
use log::LevelFilter;
use std::sync::Arc;
use tokio::runtime::Runtime;
use tokio::sync::Mutex;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(
            tauri_plugin_log::Builder::new()
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
            let handle = app.handle();
            let app_dir = app.path().app_data_dir().unwrap();
            let db_path = app_dir.join("sqlite1.db").to_str().unwrap().to_string();
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
                    let folder_repo = Arc::new(SqliteFolderRepository::new(connection.clone()));
                    let sync_repo = Arc::new(SqliteSyncRepository::new(connection.clone()));
                    let folder_service = Arc::new(FolderService::new(
                        folder_repo,
                        sync_repo,
                        "1".to_string(), // TODO: Get from config
                    ));
                    let credential_repo =
                        Arc::new(SqliteCredentialRepository::new(connection.clone()));
                    let auth_repository = Arc::new(TauriStoreAuthRepository::new(handle.clone()));
                    let crypto_utils = Arc::new(Mutex::new(CryptoUtils::new()));
                    let auth_service =
                        Arc::new(AuthService::new(auth_repository, crypto_utils.clone()));
                    let credential_service =
                        Arc::new(CredentialService::new(credential_repo, crypto_utils));
                    app.manage(folder_service);
                    app.manage(auth_service);
                    app.manage(credential_service);
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
            get_system_locale,
            check_signup_status,
            handle_save_passphrase,
            check_private_key_loaded,
            handle_get_public_key,
            handle_sign_challenge,
            handle_add_credential,
            handle_hash_and_sign,
            handle_import_certificate,
            handle_export_certificate,
            handle_change_passphrase,
            handle_add_folder,
            handle_get_folders,
            handle_get_credentials_for_folder,
            send_message,
            get_ticket,
            connect_with_ticket,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
