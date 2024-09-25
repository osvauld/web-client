use std::path::PathBuf;
use tauri::Manager;
use tauri::Wry;
use tauri_plugin_store::StoreCollection;
pub mod handler;
mod service;
mod types;
use tauri_plugin_log::{Target, TargetKind};
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let handle = app.handle();
            let stores = handle.state::<StoreCollection<Wry>>();
            let path = PathBuf::from("my_app_store4.bin");

            // Initialize the store
            tauri_plugin_store::with_store(handle.clone(), stores, path, |store| {
                // You can set initial values here if needed
                // store.insert("key".to_string(), json!("value"))?;
                store.save()
            })
            .expect("failed to initialize store");
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
