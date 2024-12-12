use anyhow::{Context, Result};
use libp2p::futures::StreamExt;
use libp2p::{
    core::multiaddr::Protocol,
    core::ConnectedPoint,
    dcutr, futures, identify, identity, noise, ping, relay,
    swarm::{NetworkBehaviour, SwarmEvent},
    tcp, yamux, Multiaddr, PeerId,
};
use log::{error, info, warn};
use std::sync::Arc;
use std::{error::Error, time::Duration};
use tauri::AppHandle;
use tauri::Manager;
use tokio::runtime::Runtime;
use tokio::sync::{mpsc, oneshot};
type BoxedError = Box<dyn Error + Send + Sync + 'static>;
use tauri::async_runtime::RwLock;
// Commands for the swarm thread

#[derive(Debug)]
enum SwarmCommand {
    StartListening {
        response_sender: oneshot::Sender<anyhow::Result<()>>,
        addresses: Vec<String>,
        relay_address: Option<Multiaddr>,
    },
    GetAddresses {
        response_sender: oneshot::Sender<Vec<String>>,
    },
    Dial {
        addr: Multiaddr,
        response_sender: oneshot::Sender<anyhow::Result<()>>,
    },
    Shutdown {
        response_sender: oneshot::Sender<anyhow::Result<()>>,
    },
}

#[derive(NetworkBehaviour)]
struct BasicBehaviour {
    ping: ping::Behaviour,
    relay_client: relay::client::Behaviour,
    dcutr: dcutr::Behaviour,
    identify: identify::Behaviour,
}

pub struct LibP2PService {
    command_sender: mpsc::Sender<SwarmCommand>,
    app_handle: AppHandle,
    connection_string: Arc<RwLock<Option<String>>>,
}

impl LibP2PService {
    pub fn new(app_handle: AppHandle) -> Self {
        let (command_tx, command_rx) = mpsc::channel(32);
        let connection_string = Arc::new(RwLock::new(None));
        let connection_string_clone = connection_string.clone();
        // Get the runtime from the app state
        let rt = app_handle.state::<Arc<Runtime>>();
        // Spawn the handler using the existing runtime
        rt.spawn(Self::swarm_handler(command_rx, connection_string_clone));
        log::info!("LibP2P service initialized");
        Self {
            command_sender: command_tx,
            app_handle,
            connection_string,
        }
    }

    fn create_swarm() -> anyhow::Result<libp2p::Swarm<BasicBehaviour>> {
        let local_key = identity::Keypair::generate_ed25519();

        // Rest of the swarm configuration remains the same
        let swarm = libp2p::SwarmBuilder::with_existing_identity(local_key.clone())
            .with_tokio()
            .with_tcp(
                tcp::Config::default().nodelay(true),
                noise::Config::new,
                yamux::Config::default,
            )?
            .with_quic()
            .with_dns()?
            .with_relay_client(noise::Config::new, yamux::Config::default)?
            .with_behaviour(|keypair, relay_behaviour| BasicBehaviour {
                relay_client: relay_behaviour,
                ping: ping::Behaviour::new(ping::Config::new()),
                identify: identify::Behaviour::new(identify::Config::new(
                    "/TODO/0.0.1".to_string(),
                    keypair.public(),
                )),
                dcutr: dcutr::Behaviour::new(keypair.public().to_peer_id()),
            })?
            .with_swarm_config(|c| c.with_idle_connection_timeout(Duration::from_secs(60)))
            .build();

        Ok(swarm)
    }
    pub async fn start_listening(&self) -> anyhow::Result<()> {
        let (response_tx, response_rx) = oneshot::channel();

        // For our local listeners, we can support both TCP and QUIC
        let addresses = vec![
            "/ip4/0.0.0.0/tcp/0".to_string(),
            "/ip4/0.0.0.0/udp/0/quic-v1".to_string(),
        ];

        // For the relay connection, we'll specifically use TCP
        let relay_addr = "/ip4/40.90.176.32/tcp/2700"
            .parse()
            .context("Failed to parse relay address")?;

        self.command_sender
            .send(SwarmCommand::StartListening {
                addresses,
                relay_address: Some(relay_addr),
                response_sender: response_tx,
            })
            .await
            .context("Failed to send start listening command")?;

        response_rx.await.context("Failed to receive response")?
    }

    pub async fn get_listening_addresses(&self) -> anyhow::Result<Vec<String>> {
        // First, wait for the circuit address to be available
        let circuit_addr = {
            let guard = self.connection_string.read().await;
            guard.clone()
        };

        let (response_tx, response_rx) = oneshot::channel();
        self.command_sender
            .send(SwarmCommand::GetAddresses {
                response_sender: response_tx,
            })
            .await
            .context("Failed to send get addresses command")?;

        let mut addresses = response_rx.await.context("Failed to receive addresses")?;

        // Add the circuit address if available
        if let Some(circuit_addr) = circuit_addr {
            addresses.push(circuit_addr);
        }

        if addresses.is_empty() {
            anyhow::bail!(
                "No listening addresses available - ensure the node is properly initialized"
            );
        }

        Ok(addresses)
    }

    async fn swarm_handler(
        mut command_rx: mpsc::Receiver<SwarmCommand>,
        connection_string: Arc<RwLock<Option<String>>>,
    ) {
        // Initialize the swarm using anyhow's ? operator instead of match
        info!("Initializing LibP2P swarm");
        let mut swarm =
            match Self::create_swarm().with_context(|| "Failed to initialize LibP2P swarm") {
                Ok(sw) => sw,
                Err(e) => {
                    error!("Failed to create swarm: {:#}", e); // Using anyhow's verbose error format
                    return;
                }
            };

        let mut listening_addresses = Vec::new();
        let mut relay_peer_id: Option<PeerId> = None;
        let mut stored_relay_addr: Option<Multiaddr> = None;
        loop {
            tokio::select! {
                Some(command) = command_rx.recv() => {
                    match command {
                        SwarmCommand::StartListening { addresses, relay_address, response_sender } => {
                            info!("Starting LibP2P listeners");
                            if let Some(relay_addr) = relay_address.clone() {
                                stored_relay_addr = Some(relay_addr);
                            }
                            // First set up local listeners (your existing TCP/QUIC setup code)
                            for addr_str in addresses {
                                match addr_str.parse::<Multiaddr>() {
                                    Ok(addr) => {
                                        match swarm.listen_on(addr.clone()) {
                                            Ok(_) => {
                                                if addr_str.contains("/tcp/") {
                                                    info!("TCP listener started successfully on {}", addr_str);
                                                } else if addr_str.contains("/quic-v1") {
                                                    info!("QUIC listener started successfully on {}", addr_str);
                                                }
                                            }
                                            Err(e) => warn!("Failed to listen on {}: {}", addr_str, e),
                                        }
                                    }
                                    Err(e) => warn!("Failed to parse address {}: {}", addr_str, e),
                                }
                            }
                            if let Some(relay_addr) = relay_address {
                                info!("Attempting to connect to relay server at {}", relay_addr);
                                match swarm.dial(relay_addr.clone()) {
                                    Ok(_) => info!("Initiated connection to relay server"),
                                    Err(e) => {
                                        let error_msg = format!("Failed to dial relay server: {:#}", e);
                                        error!("{}", error_msg);
                                        let _ = response_sender.send(Err(anyhow::anyhow!(error_msg)));
                                        return;
                                    }
                                }
                            }

                            let _ = response_sender.send(Ok(()));
                        }


                        SwarmCommand::GetAddresses { response_sender } => {
                            let _ = response_sender.send(listening_addresses.clone());
                        }

                        SwarmCommand::Dial { addr, response_sender } => {
                            let result = swarm
                                .dial(addr)
                                .context("Failed to dial peer");

                            let _ = response_sender.send(result.map_err(anyhow::Error::from));
                        }

                        SwarmCommand::Shutdown { response_sender } => {
                            let _ = response_sender.send(Ok(()));
                            info!("Shutting down LibP2P swarm");
                            return;
                        }
                    }
                }

                event = swarm.next() => {
                    if let Some(event) = event {
                        match event {

                            SwarmEvent::NewListenAddr { address, .. } => {
                                let protocol_type = if address.to_string().contains("/tcp/") {
                                    "TCP"
                                } else if address.to_string().contains("/quic-v1") {
                                    "QUIC"
                                } else {
                                    "Unknown"
                                };
                                info!("New {} listener address: {}", protocol_type, address);
                                let mut full_addr = address.clone();
                                full_addr.push(Protocol::P2p((*swarm.local_peer_id()).into()));
                                let addr_str = full_addr.to_string();
                                listening_addresses.push(addr_str.clone());

                                // Log the specific protocol that's being used
                                if address.to_string().contains("/tcp/") {
                                    info!("TCP listening on {}", addr_str);
                                } else if address.to_string().contains("/quic-v1") {
                                    info!("QUIC listening on {}", addr_str);
                                }
                            }
                            SwarmEvent::Behaviour(BasicBehaviourEvent::Identify(identify::Event::Received {
                                peer_id,
                                info,
                                ..
                            })) => {
                                info!("Identified relay server: {}", peer_id);
                                relay_peer_id = Some(peer_id);
                                if let Some(base_relay_addr) = stored_relay_addr.clone() {
                                    let full_relay_addr = base_relay_addr
                                    .with(Protocol::P2p(peer_id))
                                    .with(Protocol::P2pCircuit);

                                info!("Setting up circuit relay with complete address: {}", full_relay_addr);

                                match swarm.listen_on(full_relay_addr) {
                                    Ok(_) => info!("Successfully initiated circuit relay setup"),
                                    Err(e) => error!("Failed to set up circuit relay: {:#}", e),
                                }
                                }
                            },
                            // When relay accepts our reservation
                            SwarmEvent::Behaviour(BasicBehaviourEvent::RelayClient(
                                relay::client::Event::ReservationReqAccepted { relay_peer_id, .. }
                            )) => {

                                let circuit_addr = format!(
                                    "/ip4/40.90.176.32/tcp/2700/p2p/{}/p2p-circuit/p2p/{}",
                                    relay_peer_id,
                                    swarm.local_peer_id()
                                );

                                info!("We are reachable at: {}", circuit_addr);

                                // Store our connection string
                                let mut write_guard = connection_string.write().await;
                                *write_guard = Some(circuit_addr);
                                // Only proceed if we have the relay's peer ID

                            },
                            SwarmEvent::ConnectionEstablished {
                                peer_id,
                                endpoint,
                                num_established,
                                ..
                            } => {
                                // Log more detailed connection information
                                let connection_type = match endpoint {
                                    ConnectedPoint::Dialer { address, .. } => {
                                        format!("Outbound to {}", address)
                                    }

                                    ConnectedPoint::Listener {
                                        local_addr,
                                        send_back_addr,
                                    } => {
                                        format!("Inbound on {} from {}", local_addr, send_back_addr)
                                    }
                                };

                                info!(
                                    "Connection established with peer: {} ({}) - Total connections: {}",
                                    peer_id, connection_type, num_established
                                );
                            }
                            SwarmEvent::ConnectionClosed {
                                peer_id,
                                endpoint,
                                num_established,
                                cause,
                                ..
                            } => {
                                // Provide more context about why the connection closed
                                let connection_type = match endpoint {
                                    ConnectedPoint::Dialer { address, .. } => {
                                        format!("Outbound to {}", address)
                                    }
                                    ConnectedPoint::Listener {
                                        local_addr,
                                        send_back_addr,
                                    } => {
                                        format!("Inbound on {} from {}", local_addr, send_back_addr)
                                    }

                                };

                                info!(
                                    "Connection closed with peer: {} ({}) - Remaining connections: {} - Cause: {:?}",
                                    peer_id, connection_type, num_established, cause
                                );
                            }
                            SwarmEvent::OutgoingConnectionError { peer_id, error, connection_id } => {
                                warn!("Failed to connect to peer {:?}: {}", peer_id, error);
                            }
                            SwarmEvent::IncomingConnectionError {
                                local_addr,
                                send_back_addr,
                                error,
                                connection_id
                            } => {
                                warn!(
                                    "Failed incoming connection from {} to {}: {}",
                                    send_back_addr, local_addr, error
                                );
                            }
                            SwarmEvent::ListenerClosed {
                                listener_id,
                                addresses,
                                reason
                            } => {
                                warn!(
                                    "Listener {:?} closed. Addresses: {:?}, Reason: {:?}",
                                    listener_id, addresses, reason
                                );

                                // Remove closed addresses from our listening addresses
                                for addr in addresses {
                                    if let Some(pos) = listening_addresses.iter()
                                        .position(|x| x.contains(&addr.to_string())) {
                                        listening_addresses.remove(pos);
                                    }
                                }
                            }
                            _ => {}
                        }
                    }
                }
            }
        }
    }

    pub async fn connect_to_peer(&self, addr: String) -> anyhow::Result<()> {
        info!("Connecting to peer: {}", addr);

        // Start listening first
        self.start_listening()
            .await
            .context("Failed to start listening before connecting to peer")?;

        // Parse the multiaddr - anyhow will automatically wrap the parse error
        let multiaddr = addr.parse().context("Failed to parse peer address")?;

        // Send the dial command
        let (response_tx, response_rx) = oneshot::channel();
        self.command_sender
            .send(SwarmCommand::Dial {
                addr: multiaddr,
                response_sender: response_tx,
            })
            .await
            .context("Failed to send dial command")?;

        // Wait for the response
        response_rx
            .await
            .context("Failed to receive dial response")?
    }

    pub async fn shutdown(&self) -> anyhow::Result<()> {
        let (response_tx, response_rx) = oneshot::channel();

        // Send shutdown command with better error context
        self.command_sender
            .send(SwarmCommand::Shutdown {
                response_sender: response_tx,
            })
            .await
            .context("Failed to send shutdown command")?;

        // Wait for confirmation with meaningful error context
        response_rx
            .await
            .context("Failed to receive shutdown confirmation")?
    }
}
