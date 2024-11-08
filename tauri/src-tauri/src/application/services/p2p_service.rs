use crate::domains::models::p2p::{ConnectionTicket, Message};
use crate::types::CryptoResponse;
use futures_lite::StreamExt;
use iroh::net::relay::RelayMode;
use iroh::net::{Endpoint, NodeAddr};
use iroh_net::endpoint::Connection;
use iroh_net::endpoint::DirectAddrType;
use log::{error, info};
use std::sync::Arc;
use tauri::AppHandle;
use tauri::Emitter;
use tokio::io::AsyncWriteExt;
use tokio::sync::Mutex;
use tokio::time::{timeout, Duration};

const ALPN_PROTOCOL: &[u8] = b"n0/osvauld/0";
const CONNECTION_TIMEOUT: Duration = Duration::from_secs(10);
const HANDSHAKE_TIMEOUT: Duration = Duration::from_secs(5);

struct P2PState {
    endpoint: Arc<Endpoint>,
    active_connection: Arc<Mutex<Option<Arc<Connection>>>>,
}

pub struct P2PService {
    state: Arc<Mutex<Option<P2PState>>>,
    app_handle: AppHandle,
}

impl P2PService {
    pub async fn new(app_handle: AppHandle) -> Self {
        Self {
            state: Arc::new(Mutex::new(None)),
            app_handle,
        }
    }
    async fn ensure_initialized(&self) -> Result<(), String> {
        let mut state = self.state.lock().await;
        if state.is_some() {
            return Ok(());
        }

        let endpoint = Endpoint::builder()
            .relay_mode(RelayMode::Default)
            .alpns(vec![ALPN_PROTOCOL.to_vec()])
            .discovery_n0()
            .bind_addr_v4(
                "0.0.0.0:0"
                    .parse()
                    .map_err(|e| format!("Address parse error: {}", e))?,
            )
            .bind()
            .await
            .map_err(|e| format!("Failed to bind endpoint: {}", e))?;

        *state = Some(P2PState {
            endpoint: Arc::new(endpoint),
            active_connection: Arc::new(Mutex::new(None)),
        });

        Ok(())
    }

    pub async fn start_listening(&self) -> Result<CryptoResponse, String> {
        // Ensure P2P is initialized
        self.ensure_initialized().await?;
        let state_guard = self.state.lock().await;
        let state = state_guard.as_ref().unwrap();
        let endpoint = state.endpoint.clone();
        let active_connection = state.active_connection.clone();
        let app_handle = self.app_handle.clone();

        tokio::spawn(async move {
            info!("Starting listener for incoming connections");
            while let Some(incoming) = endpoint.accept().await {
                match incoming.accept() {
                    Ok(connecting) => {
                        info!("Accepting incoming connection");
                        app_handle
                            .emit("peer-connected", true)
                            .unwrap_or_else(|e| error!("Failed to emit connection event: {}", e));

                        let app_handle = app_handle.clone();
                        let active_connection = active_connection.clone();

                        tokio::spawn(async move {
                            match timeout(CONNECTION_TIMEOUT, connecting).await {
                                Ok(Ok(conn)) => {
                                    let mut active_conn = active_connection.lock().await;
                                    *active_conn = Some(Arc::new(conn));
                                    app_handle.emit("sync-complete", true).unwrap_or_else(|e| {
                                        error!("Failed to emit sync event: {}", e)
                                    });
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

        Ok(CryptoResponse::Success)
    }

    async fn perform_handshake(&self, conn: &Connection, is_initiator: bool) -> Result<(), String> {
        let (mut send, mut recv) = match timeout(CONNECTION_TIMEOUT, async {
            if is_initiator {
                conn.open_bi().await
            } else {
                conn.accept_bi().await
            }
        })
        .await
        .map_err(|e| format!("Handshake timeout: {}", e))?
        {
            Ok(stream) => stream,
            Err(e) => return Err(format!("Stream establishment failed: {}", e)),
        };

        if is_initiator {
            send.write_all(b"hello")
                .await
                .map_err(|e| format!("Failed to send hello: {}", e))?;
            send.flush()
                .await
                .map_err(|e| format!("Failed to flush hello: {}", e))?;

            let mut buffer = [0u8; 1024];
            match timeout(HANDSHAKE_TIMEOUT, recv.read(&mut buffer)).await {
                Ok(Ok(Some(n))) => {
                    let response = String::from_utf8_lossy(&buffer[..n]);
                    if response != "welcome" {
                        return Err("Invalid handshake response".to_string());
                    }
                }
                _ => return Err("Handshake read error".to_string()),
            }
        } else {
            let mut buffer = [0u8; 1024];
            match timeout(HANDSHAKE_TIMEOUT, recv.read(&mut buffer)).await {
                Ok(Ok(Some(n))) => {
                    let message = String::from_utf8_lossy(&buffer[..n]);
                    if message != "hello" {
                        return Err("Invalid handshake message".to_string());
                    }
                }
                _ => return Err("Handshake read error".to_string()),
            }

            send.write_all(b"welcome")
                .await
                .map_err(|e| format!("Failed to send welcome: {}", e))?;
            send.flush()
                .await
                .map_err(|e| format!("Failed to flush welcome: {}", e))?;
        }

        Ok(())
    }

    pub async fn send_message(&self, message: String) -> Result<CryptoResponse, String> {
        let state_guard = self.state.lock().await;
        let state = state_guard.as_ref().ok_or("P2P not initialized")?;

        let connection = {
            let active_conn = state.active_connection.lock().await;
            match &*active_conn {
                Some(conn) => Arc::clone(conn),
                None => return Err("No active connection".to_string()),
            }
        };

        let (mut send, _) = connection
            .open_bi()
            .await
            .map_err(|e| format!("Failed to open bi-directional stream: {}", e))?;

        let msg = Message::Chat(message);
        let serialized = serde_json::to_string(&msg).map_err(|e| e.to_string())?;

        send.write_all(serialized.as_bytes())
            .await
            .map_err(|e| e.to_string())?;
        send.flush().await.map_err(|e| e.to_string())?;

        Ok(CryptoResponse::Success)
    }

    pub async fn get_connection_ticket(&self) -> Result<String, String> {
        self.ensure_initialized().await?;
        let state_guard = self.state.lock().await;
        let state = state_guard.as_ref().ok_or("P2P not initialized")?;

        let addrs = state
            .endpoint
            .direct_addresses()
            .next()
            .await
            .ok_or_else(|| "No direct addresses available".to_string())?
            .into_iter()
            .filter(|direct_addr| matches!(direct_addr.typ, DirectAddrType::Stun))
            .map(|e| e.addr.to_string())
            .collect::<Vec<_>>();

        let ticket = ConnectionTicket {
            node_id: state.endpoint.node_id().to_string(),
            addresses: addrs,
        };

        serde_json::to_string(&ticket).map_err(|e| e.to_string())
    }

    pub async fn connect_with_ticket(&self, ticket_str: &str) -> Result<(), String> {
        self.ensure_initialized().await?;
        let state_guard = self.state.lock().await;
        let state = state_guard.as_ref().ok_or("P2P not initialized")?;

        let ticket: ConnectionTicket = serde_json::from_str(ticket_str)
            .map_err(|e| format!("Invalid ticket format: {}", e))?;

        info!("Connecting to node: {}", ticket.node_id);

        let node_addr = NodeAddr::from_parts(
            ticket
                .node_id
                .parse()
                .map_err(|e| format!("Invalid node ID: {}", e))?,
            None,
            ticket
                .addresses
                .iter()
                .filter_map(|a| a.parse().ok())
                .collect::<Vec<_>>(),
        );

        match timeout(
            CONNECTION_TIMEOUT,
            state.endpoint.connect(node_addr, ALPN_PROTOCOL),
        )
        .await
        .map_err(|e| format!("Connection timeout: {}", e))?
        .map_err(|e| format!("Connection failed: {}", e))?
        {
            conn => {
                info!("Connected to: {}", conn.remote_address());
                self.perform_handshake(&conn, true).await?;

                {
                    let mut active_conn = state.active_connection.lock().await;
                    *active_conn = Some(Arc::new(conn));
                }

                self.app_handle
                    .emit("sync-complete", true)
                    .map_err(|e| format!("Failed to emit sync event: {}", e))?;

                Ok(())
            }
        }
    }
}
