use tauri::{Manager, State};
use tauri_plugin_store::StoreCollection;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::Wry;

#[derive(Debug, Deserialize)]
pub enum CryptoAction {
    #[serde(rename = "isSignedUp")]
    IsSignedUp,
}

#[derive(Serialize)]
pub enum CryptoResponse {
    IsSignedUp(bool),
    Error(String),
}

#[tauri::command]
pub async fn handle_crypto_action(
    action: CryptoAction,
    stores: State<'_, StoreCollection<Wry>>,
    app_handle: tauri::AppHandle,
) -> Result<CryptoResponse, String> {
    let path = PathBuf::from("my_app_store.bin");

    match action {
        CryptoAction::IsSignedUp => {
            let is_signed_up = tauri_plugin_store::with_store(app_handle, stores, path, |store| {
                Ok(store.get("certificate").is_some())
            })
            .map_err(|e| e.to_string())?;

            Ok(CryptoResponse::IsSignedUp(is_signed_up))
        },
    }
}