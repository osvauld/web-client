use crate::application::services::sync_service::SyncService;
use crate::application::services::SyncPayload;
use crate::domains::models::p2p::{ConnectionTicket, Message};
use crate::types::CryptoResponse;
use futures_lite::StreamExt;
use iroh::net::relay::RelayMode;
use iroh::net::{Endpoint, NodeAddr};
use iroh_blobs::store::mem::Store;
use iroh_net::endpoint::Connection;
use iroh_net::endpoint::DirectAddrType;
use iroh_net::endpoint::{RecvStream, SendStream};
use log::{debug, error, info, warn};
use std::net::Ipv6Addr;
use std::net::SocketAddrV6;
use std::sync::Arc;
use tauri::AppHandle;
use tauri::Emitter;
use tauri::Manager;
use tokio::io::AsyncWriteExt;
use tokio::sync::Mutex;
use tokio::time::{timeout, Duration};
const ALPN_PROTOCOL: &[u8] = b"n0/osvauld/0";
const CONNECTION_TIMEOUT: Duration = Duration::from_secs(30);
const HANDSHAKE_TIMEOUT: Duration = Duration::from_secs(30);
struct P2PState {
    endpoint: Arc<Endpoint>,
    active_connection: Arc<Mutex<Option<Arc<Connection>>>>,
}
#[derive(Clone)]
pub struct P2PService {
    state: Arc<Mutex<Option<P2PState>>>,
    app_handle: AppHandle,
    sync_service: Arc<SyncService>,
}

impl P2PService {
    pub fn new(app_handle: AppHandle, sync_service: Arc<SyncService>) -> Self {
        Self {
            state: Arc::new(Mutex::new(None)),
            app_handle,
            sync_service,
        }
    }
    async fn ensure_initialized(&self) -> Result<(), String> {
        let mut state = self.state.lock().await;
        if state.is_some() {
            return Ok(());
        }

        info!("Initializing P2P endpoint");

        // Create IPv6 unspecified address with port 0
        let bind_addr = SocketAddrV6::new(
            Ipv6Addr::UNSPECIFIED,
            0,
            0, // flowinfo
            0, // scope_id
        );

        let endpoint = Endpoint::builder()
            .relay_mode(RelayMode::Default)
            .alpns(vec![ALPN_PROTOCOL.to_vec()])
            .discovery_n0()
            .bind_addr_v6(bind_addr)
            .bind()
            .await
            .map_err(|e| format!("Failed to bind endpoint: {}", e))?;

        *state = Some(P2PState {
            endpoint: Arc::new(endpoint),
            active_connection: Arc::new(Mutex::new(None)),
        });

        info!("P2P initialization successful");
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
        let self_clone = self.clone(); // Clone self for use in the spawned task

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
                        let self_clone = self_clone.clone();

                        tokio::spawn(async move {
                            match timeout(CONNECTION_TIMEOUT, connecting).await {
                                Ok(Ok(conn)) => {
                                    info!("Connection established, initiating handshake");
                                    // Perform handshake as the receiver (non-initiator)
                                    match self_clone.perform_handshake(&conn, false).await {
                                        Ok(()) => {
                                            info!("Handshake completed successfully");
                                            let mut active_conn = active_connection.lock().await;
                                            *active_conn = Some(Arc::new(conn));
                                            app_handle.emit("sync-complete", true).unwrap_or_else(
                                                |e| error!("Failed to emit sync event: {}", e),
                                            );
                                        }
                                        Err(e) => {
                                            error!("Handshake failed: {}", e);
                                            app_handle.emit("handshake-failed", e.to_string()).unwrap_or_else(|e| {
                                                error!("Failed to emit handshake failure event: {}", e)
                                            });
                                        }
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

        Ok(CryptoResponse::Success)
    }

    async fn perform_handshake(&self, conn: &Connection, is_initiator: bool) -> Result<(), String> {
        let (mut send, mut recv) = match timeout(CONNECTION_TIMEOUT, async {
            if is_initiator {
                info!("Initiator: Opening bi-directional stream");
                conn.open_bi().await
            } else {
                info!("Receiver: Accepting bi-directional stream");
                conn.accept_bi().await
            }
        })
        .await
        .map_err(|e| format!("Stream timeout: {}", e))?
        {
            Ok(stream) => stream,
            Err(e) => return Err(format!("Stream establishment failed: {}", e)),
        };

        if is_initiator {
            self.initiate_handshake(&mut send, &mut recv).await?;
        } else {
            self.accept_handshake(&mut send, &mut recv).await?;
        }

        {
            let state_guard = self.state.lock().await;
            let state = state_guard.as_ref().unwrap();
            let mut active_conn = state.active_connection.lock().await;
            *active_conn = Some(Arc::new(conn.clone()));
        }
        let self_clone = self.clone();

        tokio::spawn({
            async move {
                info!(
                    "Starting message listener for {}",
                    if is_initiator {
                        "initiator"
                    } else {
                        "receiver"
                    }
                );
                self_clone.handle_messages().await;
            }
        });
        info!(
            "Handshake completed successfully for {}",
            if is_initiator {
                "initiator"
            } else {
                "receiver"
            }
        );
        if is_initiator {
            self.start_sync().await?;
        }
        //  else {
        //     let app_data_dir = self.app_handle.path().app_data_dir().unwrap();
        //     let test_file_path = app_data_dir.join("test.txt");
        //     self.send_file(test_file_path.to_string_lossy().into_owned())
        //         .await?;
        // }

        Ok(())
    }

    async fn start_sync(&self) -> Result<(), String> {
        info!("Starting sync process");
        let connection = self.get_active_connection().await?;

        // Send sync request
        let (mut send, mut recv) = connection
            .open_bi()
            .await
            .map_err(|e| format!("Failed to open bi-directional stream: {}", e))?;

        let sync_request = Message::SyncRequest;
        let serialized = serde_json::to_string(&sync_request)
            .map_err(|e| format!("Serialization error: {}", e))?;

        send.write_all(serialized.as_bytes())
            .await
            .map_err(|e| format!("Failed to send sync request: {}", e))?;
        send.flush()
            .await
            .map_err(|e| format!("Failed to flush sync request: {}", e))?;
        info!("Sync process started");
        Ok(())
    }

    // Helper method to get active connection
    async fn get_active_connection(&self) -> Result<Arc<Connection>, String> {
        let state_guard = self.state.lock().await;
        let state = state_guard.as_ref().ok_or("P2P not initialized")?;
        let active_conn = state.active_connection.lock().await;
        active_conn
            .clone()
            .ok_or_else(|| "No active connection".to_string())
    }

    async fn initiate_handshake(
        &self,
        send: &mut SendStream,
        recv: &mut RecvStream,
    ) -> Result<(), String> {
        info!("Initiator: Sending hello");
        send.write_all(b"hello")
            .await
            .map_err(|e| format!("Failed to send hello: {}", e))?;
        send.flush()
            .await
            .map_err(|e| format!("Failed to flush hello: {}", e))?;

        info!("Initiator: Waiting for welcome response");
        let mut buffer = [0u8; 1024];
        match timeout(HANDSHAKE_TIMEOUT, recv.read(&mut buffer)).await {
            Ok(Ok(Some(n))) => {
                let response = String::from_utf8_lossy(&buffer[..n]);
                info!("Initiator: Received response: {}", response);
                if response != "welcome" {
                    return Err(format!("Invalid handshake response: {}", response));
                }
                let _ = self.app_handle.emit("sync-complete", true);
            }
            Ok(Ok(None)) => return Err("Connection closed during handshake".to_string()),
            Ok(Err(e)) => return Err(format!("Read error during handshake: {}", e)),
            Err(e) => return Err(format!("Handshake timeout while reading: {}", e)),
        }
        Ok(())
    }

    async fn accept_handshake(
        &self,
        send: &mut SendStream,
        recv: &mut RecvStream,
    ) -> Result<(), String> {
        info!("Receiver: Waiting for hello");
        let mut buffer = [0u8; 1024];
        match timeout(HANDSHAKE_TIMEOUT, recv.read(&mut buffer)).await {
            Ok(Ok(Some(n))) => {
                let message = String::from_utf8_lossy(&buffer[..n]);
                info!("Receiver: Received message: {}", message);
                if message != "hello" {
                    return Err(format!("Invalid handshake message: {}", message));
                }
            }
            Ok(Ok(None)) => return Err("Connection closed during handshake".to_string()),
            Ok(Err(e)) => return Err(format!("Read error during handshake: {}", e)),
            Err(e) => return Err(format!("Handshake timeout while reading: {}", e)),
        }

        info!("Receiver: Sending welcome");
        send.write_all(b"welcome")
            .await
            .map_err(|e| format!("Failed to send welcome: {}", e))?;
        send.flush()
            .await
            .map_err(|e| format!("Failed to flush welcome: {}", e))?;

        Ok(())
    }

    async fn handle_sync_request(&self) -> Result<(), String> {
        info!("Handling incoming sync request");
        match self.sync_service.get_next_pending_sync().await {
            Ok(Some(payload)) => {
                info!(
                    "Sending sync payload for resource: {}",
                    payload.sync_record.resource_id
                );
                let message = Message::SyncResponse(payload);
                self.send_message(serde_json::to_string(&message).map_err(|e| e.to_string())?)
                    .await?;
            }
            Ok(None) => {
                info!("No pending syncs, sending sync complete");
                let message = Message::SyncComplete;
                self.send_message(serde_json::to_string(&message).map_err(|e| e.to_string())?)
                    .await?;
            }
            Err(e) => {
                error!("Failed to get pending sync: {}", e);
                return Err(e.to_string());
            }
        }
        Ok(())
    }

    async fn handle_sync_ack(&self, sync_id: String) -> Result<(), String> {
        info!("Received sync acknowledgment for ID: {}", sync_id);

        // Update the sync status
        if let Err(e) = self
            .sync_service
            .update_sync_status(&sync_id, "completed")
            .await
        {
            error!("Failed to update sync status: {}", e);
            return Err(e.to_string());
        }
        info!("Updated sync status to completed for ID: {}", sync_id);

        // Send next pending sync
        match self.sync_service.get_next_pending_sync().await {
            Ok(Some(payload)) => {
                info!(
                    "Sending next sync payload for resource: {}",
                    payload.sync_record.resource_id
                );
                let message = Message::SyncResponse(payload);
                self.send_message(serde_json::to_string(&message).map_err(|e| e.to_string())?)
                    .await?;
            }
            Ok(None) => {
                info!("No more pending syncs, sending sync complete");
                let message = Message::SyncComplete;
                self.send_message(serde_json::to_string(&message).map_err(|e| e.to_string())?)
                    .await?;
            }
            Err(e) => {
                error!("Failed to get next pending sync: {}", e);
                return Err(e.to_string());
            }
        }
        Ok(())
    }

    async fn handle_sync_response(&self, payload: SyncPayload) -> Result<(), String> {
        info!(
            "Received sync payload for resource: {}",
            payload.sync_record.resource_id
        );

        // Process the sync payload
        if let Err(e) = self.sync_service.process_sync_payload(&payload).await {
            error!("Failed to process sync payload: {}", e);
            return Err(e.to_string());
        }
        info!("Processed sync payload successfully");

        // Send acknowledgment
        info!(
            "Sending acknowledgment for sync ID: {}",
            payload.sync_record.id
        );
        let message = Message::SyncAck(payload.sync_record.id);
        self.send_message(serde_json::to_string(&message).map_err(|e| e.to_string())?)
            .await?;

        Ok(())
    }

    async fn handle_sync_complete(&self) -> Result<(), String> {
        info!("Sync process completed");
        self.app_handle
            .emit("sync-complete", true)
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    async fn handle_messages(&self) {
        info!("Starting message listener");
        loop {
            match self.get_active_connection().await {
                Ok(connection) => {
                    match connection.accept_bi().await {
                        Ok((mut send, mut recv)) => {
                            let mut buffer = vec![0u8; 1024];
                            match recv.read(&mut buffer).await {
                                Ok(Some(n)) if n > 0 => {
                                    let message_str = String::from_utf8_lossy(&buffer[..n]);
                                    match serde_json::from_str::<Message>(&message_str) {
                                        Ok(message) => {
                                            let result = match message {
                                                Message::SyncRequest => {
                                                    self.handle_sync_request().await
                                                }
                                                Message::SyncAck(sync_id) => {
                                                    self.handle_sync_ack(sync_id).await
                                                }

                                                Message::FileTransfer { name, data } => {
                                                    self.handle_file_receive(name, data).await
                                                }
                                                Message::SyncResponse(payload) => {
                                                    self.handle_sync_response(payload).await
                                                }
                                                Message::SyncComplete => {
                                                    self.handle_sync_complete().await
                                                }
                                                Message::Chat(_)
                                                | Message::Ping
                                                | Message::Pong => {
                                                    if let Err(e) = self
                                                        .app_handle
                                                        .emit("message-received", message)
                                                    {
                                                        error!("Failed to emit message: {}", e);
                                                    }
                                                    Ok(())
                                                }
                                            };

                                            if let Err(e) = result {
                                                error!("Error handling message: {}", e);
                                            }
                                        }
                                        Err(e) => error!("Failed to deserialize message: {}", e),
                                    }
                                }
                                Ok(_) => break, // Connection closed
                                Err(e) => {
                                    error!("Error reading from connection: {}", e);
                                    break;
                                }
                            }
                        }
                        Err(e) => {
                            error!("Failed to accept bi-directional stream: {}", e);
                            break;
                        }
                    }
                }
                Err(e) => {
                    error!("Failed to get active connection: {}", e);
                    break;
                }
            }
        }
        info!("Message listener stopped");
    }
    pub async fn send_file(&self, file_path: String) -> Result<(), String> {
        info!("----------- Starting File Transfer Process -----------");
        info!("Input file path: {}", file_path);

        let path = std::path::Path::new(&file_path);
        info!("Checking if file exists at: {}", path.display());
        if !path.exists() {
            let err = format!("File does not exist at path: {}", path.display());
            error!("{}", err);
            return Err(err);
        }

        let file_name = match path.file_name() {
            Some(name) => {
                let name_str = name.to_string_lossy().into_owned();
                info!("Successfully extracted file name: {}", name_str);
                name_str
            }
            None => {
                let err = format!("Could not extract file name from path: {}", file_path);
                error!("{}", err);
                return Err(err);
            }
        };

        info!("Attempting to read file contents from: {}", file_path);
        let file_data = match tokio::fs::read(&file_path).await {
            Ok(data) => {
                info!("Successfully read file. Size: {} bytes", data.len());
                info!(
                    "First few bytes (up to 10): {:?}",
                    &data.iter().take(10).collect::<Vec<_>>()
                );
                data
            }
            Err(e) => {
                let err = format!("Failed to read file contents: {}", e);
                error!("{}", err);
                return Err(err);
            }
        };

        info!(
            "Creating FileTransfer message with name: {} and data size: {}",
            file_name,
            file_data.len()
        );
        let message = Message::FileTransfer {
            name: file_name.clone(),
            data: file_data.clone(),
        };

        info!("Attempting to serialize FileTransfer message");
        let serialized = match serde_json::to_string(&message) {
            Ok(json) => {
                info!(
                    "Successfully serialized message. JSON size: {} bytes",
                    json.len()
                );
                json
            }
            Err(e) => {
                let err = format!("Failed to serialize FileTransfer message: {}", e);
                error!("{}", err);
                return Err(err);
            }
        };

        info!("Attempting to send serialized message");
        match self.send_message(serialized).await {
            Ok(_) => {
                info!("----------- File Transfer Complete -----------");
                info!("Successfully sent file: {}", file_name);
                info!("Total bytes transferred: {}", file_data.len());
                Ok(())
            }
            Err(e) => {
                let err = format!("Failed to send message through connection: {}", e);
                error!("----------- File Transfer Failed -----------");
                error!("{}", err);
                Err(err)
            }
        }
    }

    async fn handle_file_receive(&self, name: String, data: Vec<u8>) -> Result<(), String> {
        // Get app data directory and create downloads folder within it
        let app_data_dir = self.app_handle.path().app_data_dir().unwrap();
        let downloads_dir = app_data_dir.join("downloads");

        // Create downloads directory
        tokio::fs::create_dir_all(&downloads_dir)
            .await
            .map_err(|e| format!("Failed to create downloads directory: {}", e))?;

        // Write file to downloads directory
        let file_path = downloads_dir.join(&name);
        tokio::fs::write(&file_path, data)
            .await
            .map_err(|e| format!("Failed to write file: {}", e))?;

        info!("File saved to: {}", file_path.display());

        // Emit event to notify UI
        if let Err(e) = self.app_handle.emit("file-received", name) {
            error!("Failed to emit file received event: {}", e);
        }

        Ok(())
    }
    pub async fn send_chat_message(&self, message: String) -> Result<CryptoResponse, String> {
        let msg = Message::Chat(message);
        let serialized = serde_json::to_string(&msg).map_err(|e| e.to_string())?;
        self.send_message(serialized).await
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

        send.write_all(message.as_bytes())
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

        // Create connection info in a separate scope
        let (endpoint, node_addr) = {
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

            (state.endpoint.clone(), node_addr)
        }; // state_guard is dropped here

        // Establish connection
        let conn = match timeout(
            CONNECTION_TIMEOUT,
            endpoint.connect(node_addr, ALPN_PROTOCOL),
        )
        .await
        .map_err(|e| format!("Connection timeout: {}", e))?
        .map_err(|e| format!("Connection failed: {}", e))?
        {
            conn => {
                info!("Connected to: {}", conn.remote_address());
                conn
            }
        };

        // Perform handshake
        self.perform_handshake(&conn, true).await?;

        self.app_handle
            .emit("sync-complete", true)
            .map_err(|e| format!("Failed to emit sync event: {}", e))?;

        Ok(())
    }
}
