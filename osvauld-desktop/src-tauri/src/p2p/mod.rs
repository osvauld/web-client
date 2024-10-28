use anyhow::Result;
use futures_lite::stream::StreamExt;
use iroh::net::relay::RelayMode;
use iroh::net::{Endpoint, NodeAddr};
use iroh_net::endpoint::Connection;
use iroh_net::endpoint::DirectAddrType;
use iroh_net::AddrInfo;
use log::{error, info};
use serde::{Deserialize, Serialize};
use std::net::IpAddr;
use std::sync::Arc;
use tauri::Emitter;
use tauri::Manager;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::sync::Mutex;
use tokio::time::timeout;
use tokio::time::Duration;
const ALPN_PROTOCOL: &[u8] = b"n0/osvauld/0";

#[derive(Serialize, Deserialize)]
struct ConnectionTicket {
    node_id: String,
    addresses: Vec<String>,
}

const CONNECTION_TIMEOUT: Duration = Duration::from_secs(10);
const HANDSHAKE_TIMEOUT: Duration = Duration::from_secs(5);

pub struct P2PConnection {
    endpoint: Endpoint,
    app_handle: tauri::AppHandle,
}

pub struct AppState {
    pub p2p: Arc<Mutex<Option<P2PConnection>>>,
}

impl P2PConnection {
    pub async fn new(app_handle: tauri::AppHandle) -> Result<Self> {
        let endpoint = Endpoint::builder()
            .relay_mode(RelayMode::Default)
            .alpns(vec![ALPN_PROTOCOL.to_vec()])
            .discovery_n0()
            .bind_addr_v4("0.0.0.0:0".parse()?)
            .bind()
            .await?;

        let connection = Self {
            endpoint,
            app_handle, // Store it
        };

        if let Some(addrs) = connection.endpoint.direct_addresses().next().await {
            info!("Local addresses: {:?}", addrs);
        }

        Ok(connection)
    }

    async fn handle_connection(&self, conn: &Connection, is_initiator: bool) -> Result<()> {
        let (mut send, mut recv) = match timeout(CONNECTION_TIMEOUT, async {
            if is_initiator {
                conn.open_bi().await
            } else {
                conn.accept_bi().await
            }
        })
        .await
        {
            Ok(stream_result) => match stream_result {
                Ok(stream) => stream,
                Err(e) => {
                    error!("Failed to establish bi-directional stream: {}", e);
                    return Err(anyhow::anyhow!("Stream establishment failed: {}", e));
                }
            },
            Err(e) => {
                error!("Connection timeout: {}", e);
                return Err(anyhow::anyhow!("Connection timeout: {}", e));
            }
        };

        if is_initiator {
            info!("Starting handshake as initiator");
            let mut attempts = 0;
            const MAX_ATTEMPTS: u32 = 3;

            while attempts < MAX_ATTEMPTS {
                info!("Handshake attempt {}", attempts + 1);

                // Small delay before sending to ensure receiver is ready
                tokio::time::sleep(Duration::from_millis(50)).await;

                match timeout(Duration::from_secs(5), async {
                    info!("Sending hello message");
                    send.write_all(b"hello").await?;
                    send.flush().await?;
                    info!("Hello message sent, waiting for welcome");

                    // Small delay before reading to allow for network transit
                    tokio::time::sleep(Duration::from_millis(100)).await;

                    let mut buffer = [0u8; 1024];
                    match recv.read(&mut buffer).await {
                        Ok(Some(n)) if n > 0 => {
                            let response = String::from_utf8_lossy(&buffer[..n]);
                            info!("Received response: {:?}", response);
                            if response == "welcome" {
                                info!("Valid welcome message received");
                                self.app_handle
                                    .emit("sync-complete", true)
                                    .unwrap_or_else(|e| error!("Failed to emit sync event: {}", e));
                                Ok(())
                            } else {
                                Err(anyhow::anyhow!("Unexpected response: {}", response))
                            }
                        }
                        Ok(Some(0)) => {
                            Err(anyhow::anyhow!("Peer closed connection during handshake"))
                        }
                        Ok(None) => Err(anyhow::anyhow!("Empty response received")),
                        Err(e) => Err(anyhow::anyhow!("Failed to read welcome message: {}", e)),
                        _ => Err(anyhow::anyhow!("Unhandled case in read response")),
                    }
                })
                .await
                {
                    Ok(Ok(_)) => {
                        info!("Handshake completed successfully");
                        return Ok(());
                    }
                    Ok(Err(e)) => {
                        error!("Handshake attempt {} failed: {}", attempts + 1, e);
                        if attempts == MAX_ATTEMPTS - 1 {
                            return Err(anyhow::anyhow!("Failed all handshake attempts: {}", e));
                        }
                    }
                    Err(e) => {
                        error!("Handshake attempt {} timed out: {}", attempts + 1, e);
                        if attempts == MAX_ATTEMPTS - 1 {
                            return Err(anyhow::anyhow!("Handshake timed out after all attempts"));
                        }
                    }
                }
                attempts += 1;
                tokio::time::sleep(Duration::from_millis(200 * (attempts as u64))).await;
            }
            Err(anyhow::anyhow!(
                "Failed to complete handshake after all attempts"
            ))
        } else {
            // Responder side
            info!("Starting handshake as responder");
            let mut buffer = [0u8; 1024];

            match timeout(HANDSHAKE_TIMEOUT, recv.read(&mut buffer)).await {
                Ok(read_result) => match read_result {
                    Ok(Some(n @ 1..)) => {
                        let message = String::from_utf8_lossy(&buffer[..n]);
                        info!("Received initial message: {:?}", message);

                        if message != "hello" {
                            return Err(anyhow::anyhow!("Unexpected initial message: {}", message));
                        }

                        // Small delay before sending response
                        tokio::time::sleep(Duration::from_millis(50)).await;

                        info!("Sending welcome message");
                        match timeout(HANDSHAKE_TIMEOUT, async {
                            send.write_all(b"welcome").await?;
                            send.flush().await?;

                            // Hold the connection open briefly to ensure the message is received
                            tokio::time::sleep(Duration::from_millis(100)).await;

                            Ok::<(), anyhow::Error>(())
                        })
                        .await
                        {
                            Ok(result) => match result {
                                Ok(_) => {
                                    info!("Welcome message sent successfully");
                                    Ok(())
                                }
                                Err(e) => {
                                    error!("Failed to send welcome message: {}", e);
                                    Err(anyhow::anyhow!("Failed to send welcome: {}", e))
                                }
                            },
                            Err(e) => {
                                error!("Timeout sending welcome message: {}", e);
                                Err(anyhow::anyhow!("Timeout sending welcome: {}", e))
                            }
                        }
                    }
                    Ok(Some(0)) => Err(anyhow::anyhow!("Peer closed connection")),
                    Ok(None) => Err(anyhow::anyhow!("Empty message received")),
                    Err(e) => {
                        error!("Read error: {}", e);
                        Err(anyhow::anyhow!("Read error: {}", e))
                    }
                },
                Err(e) => {
                    error!("Read timeout: {}", e);
                    Err(anyhow::anyhow!("Read timeout: {}", e))
                }
            }
        }
    }

    pub async fn share_ticket(&self) -> Result<String> {
        // Only get relay addresses, filter out local addresses
        let addrs = self
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
            node_id: self.endpoint.node_id().to_string(),
            addresses: addrs,
        };

        let ticket_str = serde_json::to_string(&ticket)?;
        info!("Generated connection ticket: {}", ticket_str);
        Ok(ticket_str)
    }

    pub async fn connect_with_ticket(&self, ticket_str: &str) -> Result<()> {
        let ticket: ConnectionTicket = serde_json::from_str(ticket_str)?;
        info!("Connecting to node: {}", ticket.node_id);

        let node_addr = NodeAddr::from_parts(
            ticket.node_id.parse()?,
            Some("https://aps1-1.relay.iroh.network./".parse()?),
            ticket
                .addresses
                .iter()
                .filter_map(|addr| addr.parse().ok())
                .collect::<Vec<_>>(),
        );

        match timeout(
            CONNECTION_TIMEOUT,
            self.endpoint.connect(node_addr, ALPN_PROTOCOL),
        )
        .await?
        {
            Ok(conn) => {
                info!("Connected to: {}", conn.remote_address());
                self.handle_connection(&conn, true).await
            }
            Err(e) => {
                error!("Connection timeout: {}", e);
                Err(anyhow::anyhow!("Connection timeout: {}", e))
            }
        }
    }

    pub async fn start_listening(&self) {
        // Remove app_handle parameter since we have it in self
        let endpoint = self.endpoint.clone();
        let app_handle = self.app_handle.clone();

        tokio::spawn(async move {
            info!("Starting listener for incoming connections");
            while let Some(incoming) = endpoint.accept().await {
                match incoming.accept() {
                    Ok(connecting) => {
                        info!(
                            "Accepting incoming connection from {}",
                            connecting.remote_address()
                        );

                        app_handle
                            .emit("peer-connected", true)
                            .unwrap_or_else(|e| error!("Failed to emit connection event: {}", e));

                        let endpoint = endpoint.clone();
                        let app_handle = app_handle.clone();

                        tokio::spawn(async move {
                            match timeout(CONNECTION_TIMEOUT, connecting).await {
                                Ok(Ok(conn)) => {
                                    let p2p = P2PConnection {
                                        endpoint,
                                        app_handle: app_handle.clone(),
                                    };

                                    match p2p.handle_connection(&conn, false).await {
                                        Ok(_) => {
                                            info!("Handshake completed successfully");
                                            app_handle.emit("sync-complete", true).unwrap_or_else(
                                                |e| error!("Failed to emit sync event: {}", e),
                                            );
                                        }
                                        Err(e) => error!("Handshake failed: {}", e),
                                    }
                                }
                                Ok(Err(e)) => error!("Connection establishment failed: {}", e),
                                Err(e) => error!("Connection timeout: {}", e),
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
    let p2p = P2PConnection::new(app_handle.clone()).await?;
    #[cfg(desktop)]
    {
        p2p.start_listening().await;
    }
    // Create P2P connection

    info!("P2P initialization complete");

    Ok(AppState {
        p2p: Arc::new(Mutex::new(Some(p2p))),
    })
}
