use crate::application::services::SyncPayload;
use serde::{Deserialize, Serialize};
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum Message {
    Chat(String),
    Ping,
    Pong,
    SyncRequest,
    SyncResponse(SyncPayload),
    SyncAck(String),
    SyncComplete,
    AddDevice(AddDevicePayload),
    AddDeviceAck(String),
    FileTransfer { name: String, data: Vec<u8> },
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AddDevicePayload {
    pub public_key: String,
    pub device_id: String,
}

#[derive(Serialize, Deserialize)]
pub struct ConnectionTicket {
    pub node_id: String,
    pub addresses: Vec<String>,
}
