use crate::application::services::LibP2PService;
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
pub async fn get_ticket(state: State<'_, Arc<LibP2PService>>) -> Result<Vec<String>, String> {
    // Using String as the error type
    state
        .get_listening_addresses()
        .await
        .map_err(|e| e.to_string()) // Convert anyhow::Error to String
}

#[tauri::command]
pub async fn connect_with_ticket(
    ticket: String,
    state: State<'_, Arc<LibP2PService>>,
) -> Result<(), String> {
    state
        .connect_to_peer(ticket)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn start_p2p_listener(state: State<'_, Arc<LibP2PService>>) -> Result<(), String> {
    state.start_listening().await.map_err(|e| e.to_string())
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
