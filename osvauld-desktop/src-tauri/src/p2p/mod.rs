use anyhow::Result;
use futures_lite::stream::StreamExt;
use iroh::net::relay::RelayMode;
use iroh::net::{Endpoint, NodeAddr};
use iroh_net::endpoint::Connection;
use iroh_net::endpoint::DirectAddrType;
use log::{error, info};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::Emitter;
use tokio::io::AsyncWriteExt;
use tokio::sync::Mutex;
use tokio::time::{timeout, Duration};
// Constants
const ALPN_PROTOCOL: &[u8] = b"n0/osvauld/0";
const CONNECTION_TIMEOUT: Duration = Duration::from_secs(10);
const HANDSHAKE_TIMEOUT: Duration = Duration::from_secs(5);

// Message Types
#[derive(Debug, Serialize, Deserialize)]
enum TextMessage {
    Chat(String),
    Ping,
    Pong,
}

#[derive(Serialize, Deserialize)]
struct ConnectionTicket {
    node_id: String,
    addresses: Vec<String>,
}

// Core P2P State Structure
struct P2PState {
    endpoint: Endpoint,
    active_connection: Option<Arc<Connection>>,
}

impl P2PState {
    async fn new() -> Result<Self> {
        let endpoint = Endpoint::builder()
            .relay_mode(RelayMode::Default)
            .alpns(vec![ALPN_PROTOCOL.to_vec()])
            .discovery_n0()
            .bind_addr_v4("0.0.0.0:0".parse()?)
            .bind()
            .await?;

        Ok(Self {
            endpoint,
            active_connection: None,
        })
    }
}

// Main Application State

#[derive(Clone)]
pub struct AppState {
    p2p_state: Arc<Mutex<P2PState>>,
    app_handle: tauri::AppHandle,
}

impl AppState {
    async fn new(app_handle: tauri::AppHandle) -> Result<Self> {
        let p2p_state = Arc::new(Mutex::new(P2PState::new().await?));

        Ok(Self {
            p2p_state,
            app_handle,
        })
    }

    async fn handle_connection(&self, conn: Connection, is_initiator: bool) -> Result<()> {
        self.perform_handshake(&conn, is_initiator).await?;

        {
            let mut state = self.p2p_state.lock().await;
            state.active_connection = Some(Arc::new(conn));
        }

        self.app_handle
            .emit("sync-complete", true)
            .map_err(|e| anyhow::anyhow!("Failed to emit sync event: {}", e))?;
        let app_state = self.clone();
        tokio::spawn(async move {
            app_state.run_message_listener().await;
        });

        Ok(())
    }
    // Connection Management

    async fn perform_handshake(&self, conn: &Connection, is_initiator: bool) -> Result<()> {
        let (mut send, mut recv) = match timeout(CONNECTION_TIMEOUT, async {
            if is_initiator {
                conn.open_bi().await
            } else {
                conn.accept_bi().await
            }
        })
        .await?
        {
            Ok(stream) => stream,
            Err(e) => return Err(anyhow::anyhow!("Stream establishment failed: {}", e)),
        };

        if is_initiator {
            info!("Starting handshake as initiator");
            send.write_all(b"hello").await?;
            send.flush().await?;

            let mut buffer = [0u8; 1024];
            match timeout(HANDSHAKE_TIMEOUT, recv.read(&mut buffer)).await? {
                Ok(n) => {
                    let response = String::from_utf8_lossy(&buffer[..n.unwrap_or(0)]);
                    if response != "welcome" {
                        return Err(anyhow::anyhow!("Invalid handshake response"));
                    }
                }
                Err(e) => return Err(anyhow::anyhow!("Handshake read error: {}", e)),
            }
        } else {
            info!("Starting handshake as responder");
            let mut buffer = [0u8; 1024];
            match timeout(HANDSHAKE_TIMEOUT, recv.read(&mut buffer)).await? {
                Ok(n) => {
                    let message = String::from_utf8_lossy(&buffer[..n.unwrap_or(0)]);
                    if message != "hello" {
                        return Err(anyhow::anyhow!("Invalid handshake message"));
                    }
                }
                Err(e) => return Err(anyhow::anyhow!("Handshake read error: {}", e)),
            }

            send.write_all(b"welcome").await?;
            send.flush().await?;
        }

        Ok(())
    }

    // Message Handling

    async fn run_message_listener(&self) {
        info!("Starting message listener");

        let connection = {
            let state = self.p2p_state.lock().await;
            match &state.active_connection {
                Some(conn) => conn.clone(),
                None => {
                    error!("No active connection for message listener");
                    return;
                }
            }
        };

        loop {
            // Accept a new bi-directional stream for each message
            let (mut send, mut recv) = match connection.accept_bi().await {
                Ok(stream) => stream,
                Err(e) => {
                    error!("Failed to accept bi-directional stream: {}", e);
                    break;
                }
            };

            let mut buffer = [0u8; 1024];
            match recv.read(&mut buffer).await {
                Ok(Some(n)) => {
                    let message_str = String::from_utf8_lossy(&buffer[..n]);
                    match serde_json::from_str::<TextMessage>(&message_str) {
                        Ok(message) => match self.handle_message(message).await {
                            Ok(response) => {
                                if let Err(e) = send.write_all(response.as_bytes()).await {
                                    error!("Failed to send response: {}", e);
                                    continue;
                                }
                                if let Err(e) = send.flush().await {
                                    error!("Failed to flush response: {}", e);
                                    continue;
                                }
                            }
                            Err(e) => {
                                error!("Error handling message: {}", e);
                                continue;
                            }
                        },
                        Err(e) => {
                            error!("Failed to deserialize message: {}", e);
                            continue;
                        }
                    }
                }
                Ok(None) => {
                    info!("Stream closed by peer");
                    continue;
                }
                Err(e) => {
                    error!("Error reading from connection: {}", e);
                    continue;
                }
            }
        }

        // Clean up connection when listener stops
        let mut state = self.p2p_state.lock().await;
        state.active_connection = None;
        info!("Message listener stopped");
    }
    async fn handle_message(&self, message: TextMessage) -> Result<String> {
        match message {
            TextMessage::Chat(text) => {
                self.app_handle.emit("message-received", text)?;
                Ok("ok".to_string())
            }
            TextMessage::Ping => Ok("pong".to_string()),
            TextMessage::Pong => Ok("ok".to_string()),
        }
    }
    pub async fn send_message(&self, message: String) -> Result<()> {
        let connection = {
            let state = self.p2p_state.lock().await;
            match &state.active_connection {
                Some(conn) => Arc::clone(conn),
                None => return Err(anyhow::anyhow!("No active connection")),
            }
        };

        // Open a new bi-directional stream for each message
        let (mut send, mut recv) = connection.open_bi().await?;
        let msg = TextMessage::Chat(message);
        let serialized = serde_json::to_string(&msg)?;

        send.write_all(serialized.as_bytes()).await?;
        send.flush().await?;

        // Wait for acknowledgment
        let mut buffer = [0u8; 1024];
        match timeout(Duration::from_secs(5), recv.read(&mut buffer)).await {
            Ok(Ok(Some(n))) => {
                let response = String::from_utf8_lossy(&buffer[..n]);
                if response != "ok" {
                    return Err(anyhow::anyhow!("Unexpected response: {}", response));
                }
            }
            Ok(Ok(None)) => return Err(anyhow::anyhow!("Connection closed by peer")),
            Ok(Err(e)) => return Err(anyhow::anyhow!("Failed to read response: {}", e)),
            Err(_) => return Err(anyhow::anyhow!("Response timeout")),
        }

        Ok(())
    }

    // Public API

    pub async fn share_ticket(&self) -> Result<String> {
        let state = self.p2p_state.lock().await;
        let addrs = state
            .endpoint
            .direct_addresses()
            .next()
            .await
            .ok_or_else(|| anyhow::anyhow!("No direct addresses available"))?
            .into_iter()
            .filter(|direct_addr| matches!(direct_addr.typ, DirectAddrType::Stun))
            .map(|e| e.addr.to_string())
            .collect::<Vec<_>>();

        let ticket = ConnectionTicket {
            node_id: state.endpoint.node_id().to_string(),
            addresses: addrs,
        };
        Ok(serde_json::to_string(&ticket)?)
    }

    pub async fn connect_with_ticket(&self, ticket_str: &str) -> Result<()> {
        let ticket: ConnectionTicket = serde_json::from_str(ticket_str)?;
        info!("Connecting to node: {}", ticket.node_id);

        let node_addr = NodeAddr::from_parts(
            ticket.node_id.parse()?,
            None,
            ticket
                .addresses
                .iter()
                .filter_map(|a| a.parse().ok())
                .collect::<Vec<_>>(),
        );

        let state = self.p2p_state.lock().await;
        match timeout(
            CONNECTION_TIMEOUT,
            state.endpoint.connect(node_addr, ALPN_PROTOCOL),
        )
        .await??
        {
            conn => {
                info!("Connected to: {}", conn.remote_address());
                drop(state); // Release the lock before handling connection
                self.handle_connection(conn, true).await
            }
        }
    }
}

// Initialize function
pub async fn initialize_p2p(app_handle: &tauri::AppHandle) -> Result<AppState> {
    info!("Initializing P2P connection...");

    let app_state = AppState::new(app_handle.clone()).await?;

    // Start connection listener for desktop
    #[cfg(desktop)]
    {
        let app_state = app_state.clone();

        tokio::spawn(async move {
            let endpoint = {
                let state = app_state.p2p_state.lock().await;
                state.endpoint.clone()
            };

            info!("Starting listener for incoming connections");
            while let Some(incoming) = endpoint.accept().await {
                match incoming.accept() {
                    Ok(connecting) => {
                        info!("Accepting incoming connection");
                        app_state
                            .app_handle
                            .emit("peer-connected", true)
                            .unwrap_or_else(|e| error!("Failed to emit connection event: {}", e));

                        let app_state = app_state.clone();

                        tokio::spawn(async move {
                            match timeout(CONNECTION_TIMEOUT, connecting).await {
                                Ok(Ok(conn)) => {
                                    if let Err(e) = app_state.handle_connection(conn, false).await {
                                        error!("Connection handling failed: {}", e);
                                    } else {
                                        app_state
                                            .app_handle
                                            .emit("sync-complete", true)
                                            .unwrap_or_else(|e| {
                                                error!("Failed to emit sync event: {}", e)
                                            });
                                    }
                                }
                                Ok(Err(e)) => error!("Connection failed: {}", e),
                                Err(e) => error!("Connection timeout: {}", e),
                            }
                        });
                    }
                    Err(e) => error!("Failed to accept connection: {}", e),
                }
            }
        });
    }

    info!("P2P initialization complete");
    Ok(app_state)
}
