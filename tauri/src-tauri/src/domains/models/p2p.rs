use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum Message {
    Chat(String),
    Ping,
    Pong,
}

#[derive(Serialize, Deserialize)]
pub struct ConnectionTicket {
    pub node_id: String,
    pub addresses: Vec<String>,
}
