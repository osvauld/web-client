use crate::application::services::LibP2PService;
use crate::application::services::P2PService;
use crate::types::CryptoResponse;
use serde::Serialize;
use std::error::Error;
use std::sync::Arc;
use sys_locale::get_locale;
use tauri::State;
#[derive(Serialize)]
pub struct CommandResponse<T> {
    data: Option<T>,
    error: Option<String>,
}

// Updated to accept Send + Sync error type
fn into_response<T: Serialize>(
    result: Result<T, Box<dyn Error + Send + Sync>>,
) -> CommandResponse<T> {
    match result {
        Ok(data) => CommandResponse {
            data: Some(data),
            error: None,
        },
        Err(err) => CommandResponse {
            data: None,
            error: Some(err.to_string()),
        },
    }
}

#[tauri::command]
pub async fn get_ticket(
    state: State<'_, Arc<LibP2PService>>,
) -> Result<CommandResponse<Vec<String>>, String> {
    Ok(into_response(state.get_listening_addresses().await))
}

#[tauri::command]
pub async fn connect_with_ticket(
    ticket: String,
    state: State<'_, Arc<LibP2PService>>,
) -> Result<CommandResponse<()>, String> {
    Ok(into_response(state.connect_to_peer(ticket).await))
}

#[tauri::command]
pub async fn start_p2p_listener(
    state: State<'_, Arc<LibP2PService>>,
) -> Result<CommandResponse<()>, String> {
    Ok(into_response(state.start_listening().await))
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
