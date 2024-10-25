use anyhow::Result;
use futures_lite::stream::StreamExt;
use iroh::net::relay::RelayMode;
use iroh::net::{Endpoint, NodeAddr};
use iroh_net::endpoint::Connection;
use iroh_net::AddrInfo;
use log::{error, info};
use serde::{Deserialize, Serialize};
use std::net::IpAddr;
use std::sync::Arc;
use tauri::Emitter;
use tauri::Manager;
use tokio::sync::Mutex;
use tokio::time::Duration;
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
            .relay_mode(RelayMode::Default)
            .alpns(vec![ALPN_PROTOCOL.to_vec()])
            .discovery_n0()
            .bind_addr_v4("0.0.0.0:0".parse()?)
            .bind()
            .await?;

        let connection = Self { endpoint };
        if let Some(addrs) = connection.endpoint.direct_addresses().next().await {
            info!("Local addresses: {:?}", addrs);
        }

        Ok(connection)
    }

    async fn handle_connection(&self, conn: &Connection, is_initiator: bool) -> Result<()> {
        let (mut send, mut recv) = if is_initiator {
            conn.open_bi().await?
        } else {
            conn.accept_bi().await?
        };

        // Important: The docs mention that streams are lazy - sender must send first
        if is_initiator {
            info!("Sending initial message");
            send.write_all(b"hello").await?;
            send.finish()?;
        }

        // Set timeout for both reading and writing
        let timeout = std::time::Duration::from_secs(5);

        match tokio::time::timeout(timeout, recv.read_to_end(1024)).await {
            Ok(Ok(data)) => {
                info!("Received data: {:?}", String::from_utf8_lossy(&data));

                if !is_initiator {
                    send.write_all(b"welcome").await?;
                    send.finish()?;
                }
                Ok(())
            }
            Ok(Err(e)) => Err(anyhow::anyhow!("Read error: {}", e)),
            Err(_) => Err(anyhow::anyhow!("Timeout waiting for message")),
        }
    }

    pub async fn share_ticket(&self) -> Result<String> {
        // Wait a bit for STUN to get public addresses
        tokio::time::sleep(Duration::from_secs(2)).await;

        let addrs = self
            .endpoint
            .direct_addresses()
            .next()
            .await
            .ok_or_else(|| anyhow::anyhow!("No addresses available"))?;

        let public_addrs: Vec<String> = addrs
            .into_iter()
            .map(|addr| addr.addr.to_string())
            .collect();

        if public_addrs.is_empty() {
            return Err(anyhow::anyhow!("No public addresses found"));
        }

        let ticket = ConnectionTicket {
            node_id: self.endpoint.node_id().to_string(),
            addresses: public_addrs,
        };

        let ticket_str = serde_json::to_string(&ticket)?;
        info!("Generated ticket with public addresses: {}", ticket_str);
        Ok(ticket_str)
    }

    pub async fn connect_with_ticket(&self, ticket_str: &str) -> Result<()> {
        let ticket: ConnectionTicket = serde_json::from_str(ticket_str)?;
        info!("Connecting to node: {}", ticket.node_id);

        // Using NodeAddr which can leverage discovery service

        let node_addr = NodeAddr::from_parts(
            ticket.node_id.parse()?,
            None,
            ticket
                .addresses
                .iter()
                .filter_map(|a| a.parse().ok())
                .collect::<Vec<_>>(),
        );
        let conn = self.endpoint.connect(node_addr, ALPN_PROTOCOL).await?;
        info!("Connected to: {}", conn.remote_address());

        self.handle_connection(&conn, true).await
    }
    pub async fn start_listening(&self, app_handle: tauri::AppHandle) {
        let endpoint = self.endpoint.clone();

        tokio::spawn(async move {
            info!("Starting listener for incoming connections");

            while let Some(incoming) = endpoint.accept().await {
                let endpoint_clone = endpoint.clone();
                match incoming.accept() {
                    Ok(connecting) => {
                        info!(
                            "Accepting incoming connection from {}",
                            connecting.remote_address()
                        );

                        app_handle
                            .emit("peer-connected", true)
                            .unwrap_or_else(|e| error!("Failed to emit connection event: {}", e));

                        let app_handle_clone = app_handle.clone();
                        tokio::spawn(async move {
                            match connecting.await {
                                Ok(conn) => {
                                    let p2p = P2PConnection {
                                        endpoint: endpoint_clone,
                                    };

                                    match p2p.handle_connection(&conn, false).await {
                                        Ok(_) => {
                                            info!("Handshake completed successfully");
                                            app_handle_clone
                                                .emit("sync-complete", true)
                                                .unwrap_or_else(|e| {
                                                    error!("Failed to emit sync event: {}", e)
                                                });
                                        }
                                        Err(e) => error!("Handshake failed: {}", e),
                                    }
                                }
                                Err(e) => error!("Connection establishment failed: {}", e),
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
