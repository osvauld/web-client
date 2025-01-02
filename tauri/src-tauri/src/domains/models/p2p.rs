use crate::application::services::SyncPayload;
use crate::domains::models::device::Device;
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
    AddDevice(Device),
    AddDeviceAck(String),
    FileTransfer { name: String, data: Vec<u8> },
}

#[derive(Serialize, Deserialize)]
pub struct ConnectionTicket {
    pub node_id: String,
    pub addresses: Vec<String>,
}
