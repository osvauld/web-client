use crate::application::services::LibP2PService;
use crate::application::services::P2PService;
use crate::types::CryptoResponse;
use serde::Serialize;
use std::error::Error;
use std::sync::Arc;
use sys_locale::get_locale;
use tauri::State;
#[tauri::command]
pub async fn send_message(
    message: String,
    state: State<'_, Arc<P2PService>>,
) -> Result<CryptoResponse, String> {
    state.send_chat_message(message).await
}
#[derive(Serialize)]
pub struct CommandResponse<T> {
    data: Option<T>,
    error: Option<String>,
}

// Helper function to convert our Result into a serializable response
fn into_response<T: Serialize>(
    result: Result<T, Box<dyn std::error::Error>>,
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
    state2: State<'_, Arc<LibP2PService>>,
) -> Result<CommandResponse<Vec<String>>, String> {
    Ok(into_response(state2.get_listening_addresses().await))
}

#[tauri::command]
pub async fn connect_with_ticket(
    ticket: String,
    state2: State<'_, Arc<LibP2PService>>,
) -> Result<CommandResponse<()>, String> {
    Ok(into_response(state2.connect_to_peer(ticket).await))
}

#[tauri::command]
pub async fn start_p2p_listener(
    state2: State<'_, Arc<LibP2PService>>,
) -> Result<CommandResponse<()>, String> {
    Ok(into_response(state2.start_listening().await))
}

#[tauri::command]
pub fn get_system_locale() -> String {
    get_locale().unwrap_or_else(|| String::from("en-US"))
}
