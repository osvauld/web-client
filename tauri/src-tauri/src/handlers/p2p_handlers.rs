// use crate::application::services::LibP2PService;
use crate::application::services::handle_p2p_connection;
use crate::application::services::P2PService;
use crate::types::CryptoResponse;
use anyhow::Result;
use serde::Serialize;
use std::sync::Arc;
use sys_locale::get_locale;
use tauri::State;
#[derive(Serialize)]
pub struct CommandResponse<T> {
    data: Option<T>,
    error: Option<String>,
}

#[tauri::command]
pub async fn get_ticket() -> Result<Vec<String>, String> {
    // Using String as the error type
    todo!()
    // state
    //     .get_listening_addresses()
    //     .await
    //     .map_err(|e| e.to_string()) // Convert anyhow::Error to String
}

#[tauri::command]
pub async fn connect_with_ticket(ticket: String) -> Result<(), String> {
    handle_p2p_connection(true, Some(ticket))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn start_p2p_listener() -> Result<(), String> {
    handle_p2p_connection(false, None)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_system_locale() -> String {
    get_locale().unwrap_or_else(|| String::from("en-US"))
}

#[tauri::command]
pub async fn send_message(
    message: String,
    state: State<'_, Arc<P2PService>>,
) -> Result<CryptoResponse, String> {
    state.send_chat_message(message).await
}
