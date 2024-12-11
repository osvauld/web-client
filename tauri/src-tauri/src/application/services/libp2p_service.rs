use libp2p::futures::StreamExt;
use libp2p::{
    core::multiaddr::Protocol,
    futures, noise, ping,
    swarm::{NetworkBehaviour, SwarmEvent},
    tcp, yamux, Multiaddr, PeerId,
};
use log::info;
use std::sync::Arc;
use std::{error::Error, time::Duration};
use tauri::AppHandle;
use tauri::Manager;
use tokio::runtime::Runtime;
use tokio::select;
use tokio::sync::{mpsc, oneshot}; // Added this import
type BoxedError = Box<dyn Error + Send + Sync + 'static>;
// Define our custom event type
#[derive(Debug)]
enum CustomEvent {
    Initialized(PeerId),
    NewListenAddr(String),
    PeerConnected(String),
    PeerDisconnected(String),
    Error(String),
}

// Commands for the swarm thread

#[derive(Debug)]
enum SwarmCommand {
    Initialize {
        response_sender: oneshot::Sender<Result<PeerId, BoxedError>>,
    },
    StartListening {
        response_sender: oneshot::Sender<Result<(), BoxedError>>,
    },

    GetAddresses {
        response_sender: oneshot::Sender<Vec<String>>,
    },
    Dial {
        addr: Multiaddr,
        response_sender: oneshot::Sender<Result<(), BoxedError>>,
    },
    Shutdown {
        response_sender: oneshot::Sender<Result<(), BoxedError>>,
    },
}

#[derive(NetworkBehaviour)]
struct BasicBehaviour {
    ping: ping::Behaviour,
}

pub struct LibP2PService {
    command_sender: mpsc::Sender<SwarmCommand>,
    event_receiver: mpsc::Receiver<CustomEvent>,
    app_handle: AppHandle,
}

impl LibP2PService {
    pub fn new(app_handle: AppHandle) -> Self {
        let (command_tx, command_rx) = mpsc::channel(32);
        let (event_tx, event_rx) = mpsc::channel(32);

        // Get the runtime from the app state
        let rt = app_handle.state::<Arc<Runtime>>();
        // Spawn the handler using the existing runtime
        rt.spawn(Self::swarm_handler(command_rx, event_tx));
        log::info!("LibP2P service initialized");
        Self {
            command_sender: command_tx,
            event_receiver: event_rx,
            app_handle,
        }
    }

    async fn swarm_handler(
        mut command_rx: mpsc::Receiver<SwarmCommand>,
        event_tx: mpsc::Sender<CustomEvent>,
    ) {
        info!("Starting LibP2P service handler");
        let mut swarm: Option<libp2p::Swarm<BasicBehaviour>> = None;
        let mut listening_addresses = Vec::new();

        loop {
            if let Some(sw) = &mut swarm {
                tokio::select! {
                    // Handle incoming commands
                    Some(command) = command_rx.recv() => {
                        match command {
                            SwarmCommand::Initialize { response_sender } => {
                                // Swarm already exists, just send the peer id
                                let _ = response_sender.send(Ok(*sw.local_peer_id()));
                            }
                            SwarmCommand::StartListening { response_sender } => {
                                info!("Starting LibP2P listener");
                                match sw.listen_on("/ip4/0.0.0.0/tcp/0".parse().unwrap()) {
                                    Ok(_) => {
                                        let _ = response_sender.send(Ok(()));
                                    }
                                    Err(e) => {
                                        let _ = response_sender.send(Err(Box::new(e)));
                                    }
                                }
                            }
                            SwarmCommand::GetAddresses { response_sender } => {
                                let _ = response_sender.send(listening_addresses.clone());
                            }
                            SwarmCommand::Dial { addr, response_sender } => {
                                match sw.dial(addr) {
                                    Ok(_) => {
                                        let _ = response_sender.send(Ok(()));
                                    }
                                    Err(e) => {
                                        let _ = response_sender.send(Err(Box::new(e)));
                                    }
                                }
                            }
                            SwarmCommand::Shutdown { response_sender } => {
                                let _ = response_sender.send(Ok(()));
                                return;
                            }
                        }
                    }
                    // Handle swarm events
                    event = sw.next() => {
                        if let Some(event) = event {
                            match event {
                                SwarmEvent::NewListenAddr { address, .. } => {
                                    info!("New listen address: {:?}", address);
                                    let mut full_addr = address.clone();
                                    full_addr.push(Protocol::P2p((*sw.local_peer_id()).into()));
                                    let addr_str = full_addr.to_string();
                                    listening_addresses.push(addr_str.clone());
                                    let _ = event_tx.send(CustomEvent::NewListenAddr(addr_str)).await;
                                }
                                SwarmEvent::ConnectionEstablished { peer_id, .. } => {
                                    let _ = event_tx.send(CustomEvent::PeerConnected(peer_id.to_string())).await;
                                }
                                SwarmEvent::ConnectionClosed { peer_id, .. } => {
                                    let _ = event_tx.send(CustomEvent::PeerDisconnected(peer_id.to_string())).await;
                                }
                                _ => {}
                            }
                        }
                    }
                }
            } else {
                // If swarm doesn't exist, only process commands
                if let Some(command) = command_rx.recv().await {
                    match command {
                        SwarmCommand::Initialize { response_sender } => {
                            info!("Initializing LibP2P swarm");
                            match Self::create_swarm() {
                                Ok(new_swarm) => {
                                    let peer_id = *new_swarm.local_peer_id();
                                    swarm = Some(new_swarm);
                                    let _ = response_sender.send(Ok(peer_id));
                                    let _ = event_tx.send(CustomEvent::Initialized(peer_id)).await;
                                }
                                Err(e) => {
                                    let err = Box::new(std::io::Error::new(
                                        std::io::ErrorKind::Other,
                                        e.to_string(),
                                    )) as BoxedError;
                                    let _ = response_sender.send(Err(err));
                                }
                            }
                        }
                        cmd => {
                            // Handle other commands when swarm is not initialized
                            if let SwarmCommand::Shutdown { response_sender } = cmd {
                                let _ = response_sender.send(Ok(()));
                                return;
                            }
                            let err = std::io::Error::new(
                                std::io::ErrorKind::Other,
                                "Swarm not initialized",
                            );
                            match cmd {
                                SwarmCommand::StartListening { response_sender }
                                | SwarmCommand::Dial {
                                    response_sender, ..
                                } => {
                                    let _ = response_sender.send(Err(Box::new(err)));
                                }
                                SwarmCommand::GetAddresses { response_sender } => {
                                    let _ = response_sender.send(vec![]);
                                }
                                _ => {}
                            }
                        }
                    }
                }
            }
        }
    }
    fn create_swarm() -> Result<libp2p::Swarm<BasicBehaviour>, Box<dyn Error + Send>> {
        let swarm = libp2p::SwarmBuilder::with_new_identity()
            .with_tokio()
            .with_tcp(
                tcp::Config::default(),
                noise::Config::new,
                yamux::Config::default,
            )
            .map_err(|e| Box::new(e) as Box<dyn Error + Send>)?
            .with_behaviour(|_| BasicBehaviour {
                ping: ping::Behaviour::default(),
            })
            .map_err(|e| Box::new(e) as Box<dyn Error + Send>)?
            .with_swarm_config(|cfg| cfg.with_idle_connection_timeout(Duration::from_secs(60)))
            .build();

        Ok(swarm)
    }
    pub async fn initialize(&self) -> Result<PeerId, BoxedError> {
        info!("Initializing LibP2P service");
        let (response_tx, response_rx) = oneshot::channel();

        self.command_sender
            .send(SwarmCommand::Initialize {
                response_sender: response_tx,
            })
            .await
            .map_err(|e| {
                Box::new(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    e.to_string(),
                )) as BoxedError
            })?;

        response_rx.await.map_err(|e| {
            Box::new(std::io::Error::new(
                std::io::ErrorKind::Other,
                e.to_string(),
            )) as BoxedError
        })?
    }
    pub async fn start_listening(&self) -> Result<(), BoxedError> {
        self.initialize().await?;
        let (response_tx, response_rx) = oneshot::channel();

        self.command_sender
            .send(SwarmCommand::StartListening {
                response_sender: response_tx,
            })
            .await
            .map_err(|e| {
                Box::new(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    e.to_string(),
                )) as BoxedError
            })?;

        response_rx.await.map_err(|e| {
            Box::new(std::io::Error::new(
                std::io::ErrorKind::Other,
                e.to_string(),
            )) as BoxedError
        })?
    }

    pub async fn get_listening_addresses(&self) -> Result<Vec<String>, BoxedError> {
        let (response_tx, response_rx) = oneshot::channel();

        self.command_sender
            .send(SwarmCommand::GetAddresses {
                response_sender: response_tx,
            })
            .await
            .map_err(|e| {
                Box::new(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    e.to_string(),
                )) as BoxedError
            })?;

        let addresses = response_rx.await.map_err(|e| {
            Box::new(std::io::Error::new(
                std::io::ErrorKind::Other,
                e.to_string(),
            )) as BoxedError
        })?;

        if addresses.is_empty() {
            return Err(Box::new(std::io::Error::new(
                std::io::ErrorKind::Other,
                "No listening addresses available",
            )));
        }

        Ok(addresses)
    }
    pub async fn connect_to_peer(&self, addr: String) -> Result<(), BoxedError> {
        info!("Connecting to peer: {}", addr);
        self.start_listening().await?;
        let (response_tx, response_rx) = oneshot::channel();

        self.command_sender
            .send(SwarmCommand::Dial {
                addr: addr.parse()?,
                response_sender: response_tx,
            })
            .await
            .map_err(|e| {
                Box::new(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    e.to_string(),
                )) as BoxedError
            })?;

        response_rx.await.map_err(|e| {
            Box::new(std::io::Error::new(
                std::io::ErrorKind::Other,
                e.to_string(),
            )) as BoxedError
        })?
    }

    pub async fn shutdown(&self) -> Result<(), BoxedError> {
        let (response_tx, response_rx) = oneshot::channel();

        // Convert the send error to our BoxedError type
        self.command_sender
            .send(SwarmCommand::Shutdown {
                response_sender: response_tx,
            })
            .await
            .map_err(|e| {
                Box::new(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    e.to_string(),
                )) as BoxedError
            })?;

        // Convert the receive error to our BoxedError type
        response_rx.await.map_err(|e| {
            Box::new(std::io::Error::new(
                std::io::ErrorKind::Other,
                e.to_string(),
            )) as BoxedError
        })?
    }
}
