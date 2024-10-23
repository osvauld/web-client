use anyhow::{anyhow, Result};
use futures_lite::StreamExt;
use iroh::client::docs::{Doc, LiveEvent, ShareMode};
use iroh::client::Iroh;
use iroh::docs::{ContentStatus, DocTicket};
use iroh_base::node_addr::AddrInfoOptions;
use log::{debug, error, info};
use std::sync::Arc;
use tauri::Emitter;
use tauri::Manager;
use tokio::sync::Mutex;
pub struct AppState {
    pub p2p: Mutex<Option<(P2PConnection, tokio::task::JoinHandle<()>)>>,
    pub iroh_client: Iroh,
}

impl AppState {
    pub fn new(iroh_client: Iroh) -> Self {
        AppState {
            p2p: Mutex::new(None),
            iroh_client,
        }
    }

    pub async fn init_p2p<R: tauri::Runtime>(
        &self,
        app_handle: tauri::AppHandle<R>,
        p2p: P2PConnection,
    ) -> Result<()> {
        let mut events = p2p.doc_subscribe().await?;
        let events_handle = tokio::spawn(async move {
            while let Some(Ok(event)) = events.next().await {
                match event {
                    LiveEvent::InsertRemote { content_status, .. } => {
                        if content_status == ContentStatus::Complete {
                            info!("Received remote content");
                            app_handle.emit("peer-connected", ()).ok();
                        }
                    }
                    LiveEvent::NeighborUp(peer) => {
                        info!("New peer connected: {}", peer);
                        app_handle.emit("peer-up", peer.to_string()).ok();
                    }
                    LiveEvent::NeighborDown(peer) => {
                        info!("Peer disconnected: {}", peer);
                        app_handle.emit("peer-down", peer.to_string()).ok();
                    }
                    LiveEvent::SyncFinished(event) => {
                        info!("Sync finished: {:?}", event);
                        app_handle.emit("sync-complete", ()).ok();
                    }
                    _ => debug!("Other event: {:?}", event),
                }
            }
        });

        let mut p = self.p2p.lock().await;
        if let Some((_p, handle)) = p.take() {
            handle.abort();
        }
        *p = Some((p2p, events_handle));

        Ok(())
    }
}

pub struct P2PConnection {
    doc: Doc,
    ticket: Mutex<Option<String>>, // Cache the ticket
}

impl P2PConnection {
    pub async fn new(ticket: Option<String>, iroh: &Iroh) -> Result<Self> {
        let doc = match &ticket {
            // Added reference to prevent move
            Some(ticket_str) => {
                let doc_ticket: DocTicket = ticket_str
                    .parse()
                    .map_err(|e| anyhow!("Invalid doc ticket: {}", e))?;
                iroh.docs().import(doc_ticket).await?
            }
            None => iroh.docs().create().await?,
        };
        // Generate and cache the initial ticket if we're creating a new document
        let cached_ticket = if ticket.is_none() {
            let new_ticket = doc
                .share(ShareMode::Write, AddrInfoOptions::default())
                .await?
                .to_string();
            Some(new_ticket)
        } else {
            None
        };

        Ok(Self {
            doc,
            ticket: Mutex::new(cached_ticket),
        })
    }

    pub async fn share_ticket(&self) -> Result<String> {
        let mut ticket_guard = self.ticket.lock().await;
        if let Some(ticket) = ticket_guard.as_ref() {
            Ok(ticket.clone())
        } else {
            let new_ticket = self
                .doc
                .share(ShareMode::Write, AddrInfoOptions::default())
                .await?
                .to_string();
            *ticket_guard = Some(new_ticket.clone());
            Ok(new_ticket)
        }
    }

    pub async fn doc_subscribe(
        &self,
    ) -> Result<impl StreamExt<Item = Result<LiveEvent, anyhow::Error>>> {
        Ok(self.doc.subscribe().await?)
    }

    pub async fn close(&self) -> Result<()> {
        self.doc.close().await?;
        Ok(())
    }
}

// Initialize P2P system
pub async fn initialize_p2p<R: tauri::Runtime>(
    app_handle: &tauri::AppHandle<R>,
) -> Result<AppState> {
    let data_root = app_handle.path().app_data_dir().unwrap().join("iroh_data");
    info!("Initializing iroh node at {:?}", data_root);

    // Create and initialize the node with docs enabled
    let node = iroh::node::Builder::default()
        .enable_docs()
        .persist(data_root)
        .await?
        .spawn()
        .await?;

    let iroh_client = node.client();
    let app_state = AppState::new(iroh_client.clone());

    // Create initial P2P connection with retries
    let mut retry_count = 0;
    let max_retries = 3;
    let mut last_error = None;

    while retry_count < max_retries {
        match P2PConnection::new(None, &app_state.iroh_client).await {
            Ok(p2p) => {
                // Get and log the initial ticket
                match p2p.share_ticket().await {
                    Ok(initial_ticket) => {
                        info!("Initial doc ticket created: {}", initial_ticket);
                        app_state.init_p2p(app_handle.clone(), p2p).await?;
                        return Ok(app_state);
                    }
                    Err(e) => {
                        last_error = Some(e);
                        retry_count += 1;
                        tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
                    }
                }
            }
            Err(e) => {
                last_error = Some(e);
                retry_count += 1;
                tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
            }
        }
    }

    Err(anyhow!(
        "Failed to initialize P2P after {} attempts: {:?}",
        max_retries,
        last_error
    ))
}
