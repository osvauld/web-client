use anyhow::Result;
use futures_lite::stream::StreamExt;
use iroh::net::relay::RelayMode;
use iroh::net::{Endpoint, NodeAddr};
use iroh_net::endpoint::Connection;
use log::{error, info};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::Emitter;
use tauri::Manager;
use tokio::sync::Mutex;
const ALPN_PROTOCOL: &[u8] = b"n0/osvauld/0";

#[derive(Serialize, Deserialize)]
struct ConnectionTicket {
    node_id: String,
    addresses: Vec<String>,
}

pub struct P2PConnection {
    endpoint: Endpoint,
}

pub struct AppState {
    pub p2p: Arc<Mutex<Option<P2PConnection>>>,
}

impl P2PConnection {
    pub async fn new() -> Result<Self> {
        let endpoint = Endpoint::builder()
            .relay_mode(RelayMode::Disabled)
            .alpns(vec![ALPN_PROTOCOL.to_vec()])
            .bind_addr_v4("0.0.0.0:0".parse()?)
            .bind()
            .await?;

        let connection = Self { endpoint };
        info!(
            "Created endpoint with ID: {}",
            connection.endpoint.node_id()
        );

        if let Some(addrs) = connection.endpoint.direct_addresses().next().await {
            info!("Local addresses: {:?}", addrs);
        }

        Ok(connection)
    }

    async fn handle_connection(&self, conn: &Connection, is_initiator: bool) -> Result<()> {
        if is_initiator {
            // Mobile (initiator) side
            info!("Initiating handshake as mobile");

            // Open bi-directional stream
            let (mut send, mut recv) = conn.open_bi().await?;

            // Send hello and wait for it to complete
            info!("Sending hello");
            send.write_all(b"hello").await?;
            send.finish()?; // finish() is not async
            info!("Hello sent, waiting for welcome");
            let mut buffer = vec![0u8; 1024];

            // Set a timeout for reading the response
            match tokio::time::timeout(std::time::Duration::from_secs(5), recv.read(&mut buffer))
                .await
            {
                Ok(read_result) => {
                    let n = read_result?;
                    match n {
                        Some(size) => {
                            let msg = String::from_utf8_lossy(&buffer[0..size]);
                            info!("Received response: {:?}", msg);

                            if msg != "welcome" {
                                return Err(anyhow::anyhow!(
                                    "Invalid response: expected 'welcome', got '{}'",
                                    msg
                                ));
                            }
                            info!("Handshake completed successfully");
                            Ok(())
                        }
                        None => Err(anyhow::anyhow!(
                            "Connection closed before receiving welcome"
                        )),
                    }
                }
                Err(_) => Err(anyhow::anyhow!("Timeout waiting for welcome message")),
            }
        } else {
            info!("Waiting for handshake as desktop");

            // Accept incoming stream with timeout
            let (mut send, mut recv) = conn.accept_bi().await?;

            // Create a buffer to read into
            let mut buffer = vec![0u8; 1024];

            // Set a timeout for reading the hello message
            match tokio::time::timeout(std::time::Duration::from_secs(5), recv.read(&mut buffer))
                .await
            {
                Ok(read_result) => {
                    let n = read_result?;
                    match n {
                        Some(size) => {
                            let msg = String::from_utf8_lossy(&buffer[0..size]);
                            info!("Received message: {:?}", msg);

                            if msg == "hello" {
                                // Send welcome and ensure it's sent
                                info!("Sending welcome");
                                send.write_all(b"welcome").await?;
                                send.finish()?; // Make finish async
                                info!("Welcome sent and confirmed");

                                // Keep the connection alive for a moment to ensure message is received
                                tokio::time::sleep(std::time::Duration::from_millis(100)).await;
                                Ok(())
                            } else {
                                Err(anyhow::anyhow!("Expected 'hello', got '{}'", msg))
                            }
                        }
                        None => Err(anyhow::anyhow!("Connection closed before receiving hello")),
                    }
                }
                Err(_) => Err(anyhow::anyhow!("Timeout waiting for hello message")),
            }
        }
    }

    pub async fn share_ticket(&self) -> Result<String> {
        let addrs = self
            .endpoint
            .direct_addresses()
            .next()
            .await
            .ok_or_else(|| anyhow::anyhow!("No direct addresses available"))?;

        let ticket = ConnectionTicket {
            node_id: self.endpoint.node_id().to_string(),
            addresses: addrs.into_iter().map(|e| e.addr.to_string()).collect(),
        };

        let ticket_str = serde_json::to_string(&ticket)?;
        info!("Generated connection ticket: {}", ticket_str);
        Ok(ticket_str)
    }

    pub async fn connect_with_ticket(&self, ticket_str: &str) -> Result<()> {
        info!("Connecting with ticket: {}", ticket_str);
        let ticket: ConnectionTicket = serde_json::from_str(ticket_str)?;

        let addresses = ticket
            .addresses
            .iter()
            .filter_map(|addr| addr.parse().ok())
            .collect::<Vec<_>>();

        if addresses.is_empty() {
            return Err(anyhow::anyhow!("No valid addresses in ticket"));
        }

        let node_addr = NodeAddr::from_parts(ticket.node_id.parse()?, None, addresses);

        let conn = tokio::time::timeout(
            std::time::Duration::from_secs(10),
            self.endpoint.connect(node_addr, ALPN_PROTOCOL),
        )
        .await??;

        info!("Connected to: {}", conn.remote_address());

        // Handle as initiator (mobile)
        self.handle_connection(&conn, true).await?;

        Ok(())
    }

    pub async fn start_listening(&self, app_handle: tauri::AppHandle) {
        let endpoint = self.endpoint.clone();

        tokio::spawn(async move {
            while let Some(incoming) = endpoint.accept().await {
                let endpoint_clone = endpoint.clone();
                match incoming.accept() {
                    Ok(connecting) => {
                        info!(
                            "New incoming connection from {}",
                            connecting.remote_address()
                        );

                        if let Err(e) = app_handle.emit("peer-connected", true) {
                            error!("Failed to emit connection event: {}", e);
                        }

                        let app_handle_clone = app_handle.clone();
                        tokio::spawn(async move {
                            match connecting.await {
                                Ok(conn) => {
                                    let p2p = P2PConnection {
                                        endpoint: endpoint_clone,
                                    };
                                    // Handle as responder (desktop)
                                    match p2p.handle_connection(&conn, false).await {
                                        Ok(_) => {
                                            if let Err(e) =
                                                app_handle_clone.emit("sync-complete", true)
                                            {
                                                error!("Failed to emit sync event: {}", e);
                                            }
                                        }
                                        Err(e) => error!("Connection handling failed: {}", e),
                                    }
                                }
                                Err(e) => error!("Connection failed: {}", e),
                            }
                        });
                    }
                    Err(e) => error!("Failed to accept connection: {}", e),
                }
            }
        });
    }
}

pub async fn initialize_p2p(app_handle: &tauri::AppHandle) -> Result<AppState> {
    info!("Initializing P2P connection...");

    // Start listening for connections

    let p2p = P2PConnection::new().await?;
    #[cfg(desktop)]
    {
        p2p.start_listening(app_handle.clone()).await;
    }
    // Create P2P connection

    info!("P2P initialization complete");

    Ok(AppState {
        p2p: Arc::new(Mutex::new(Some(p2p))),
    })
}
