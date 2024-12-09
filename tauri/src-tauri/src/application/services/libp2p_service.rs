use libp2p::{
    core::multiaddr::Protocol,
    futures::StreamExt,
    identity, noise, ping,
    swarm::{NetworkBehaviour, SwarmEvent},
    tcp, yamux, Multiaddr, PeerId, SwarmBuilder,
};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::{error::Error, time::Duration};
use tauri::{AppHandle, Emitter};
use tokio::sync::Mutex;

// Define the core behavior for our P2P network
#[derive(NetworkBehaviour)]
struct BasicBehaviour {
    // Ping protocol for connection liveness
    ping: ping::Behaviour,
}

pub struct LibP2PService {
    app_handle: AppHandle,
    swarm: Arc<Mutex<Option<libp2p::Swarm<BasicBehaviour>>>>,
    is_ready: Arc<AtomicBool>,
    listening_addresses: Arc<Mutex<Vec<String>>>,
}

impl LibP2PService {
    pub fn new(app_handle: AppHandle) -> Self {
        Self {
            app_handle,
            swarm: Arc::new(Mutex::new(None)),
            is_ready: Arc::new(AtomicBool::new(false)),
            listening_addresses: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub async fn start_listening(&self) -> Result<(), Box<dyn Error>> {
        self.initialize().await?;

        {
            let mut swarm_lock = self.swarm.lock().await;
            let swarm = swarm_lock.as_mut().ok_or("Swarm not initialized")?;
            swarm.listen_on("/ip4/0.0.0.0/tcp/0".parse()?)?;
        }

        let app_handle = self.app_handle.clone();
        let swarm_clone = self.swarm.clone();
        let is_ready = self.is_ready.clone();
        let addresses = self.listening_addresses.clone();
        tokio::spawn(async move {
            loop {
                // Get the next event, properly handling the Option type
                let event = {
                    let mut swarm_lock = swarm_clone.lock().await;
                    match swarm_lock.as_mut() {
                        Some(swarm) => swarm.next().await,
                        None => break, // Exit the loop if swarm is None
                    }
                };

                // Process the event if we have one
                match event {
                    Some(SwarmEvent::NewListenAddr { address, .. }) => {
                        println!("Listening on {:?}", address);
                        is_ready.store(true, Ordering::SeqCst);
                        let mut addr_lock = addresses.lock().await;
                        addr_lock.push(address.to_string());
                        let _ = app_handle.emit("listening-address", address.to_string());
                    }
                    Some(SwarmEvent::ConnectionEstablished { peer_id, .. }) => {
                        println!("Connection established with: {}", peer_id);
                        let _ = app_handle.emit("peer-connected", peer_id.to_string());
                    }
                    Some(SwarmEvent::ConnectionClosed { peer_id, .. }) => {
                        println!("Connection closed with: {}", peer_id);
                        let _ = app_handle.emit("peer-disconnected", peer_id.to_string());
                    }
                    Some(SwarmEvent::Behaviour(event)) => match event {
                        BasicBehaviourEvent::Ping(ping::Event {
                            peer,
                            connection: _,
                            result,
                        }) => match result {
                            Ok(duration) => {
                                println!("Ping success from {}: {}ms", peer, duration.as_millis());
                            }
                            Err(err) => {
                                println!("Ping error with {}: {}", peer, err);
                            }
                        },
                    },
                    Some(_) => {}  // Handle other events
                    None => break, // Exit if we get None from swarm.next()
                }
            }
        });

        // Wait for the swarm to be ready
        while !self.is_ready.load(Ordering::SeqCst) {
            tokio::task::yield_now().await;
        }

        Ok(())
    }
    // Initialize the P2P service
    pub async fn initialize(&self) -> Result<(), Box<dyn Error>> {
        let mut swarm_lock = self.swarm.lock().await;
        if swarm_lock.is_some() {
            return Ok(());
        }

        // Create a new swarm with a newly generated identity
        let swarm = libp2p::SwarmBuilder::with_new_identity()
            // Use Tokio as the executor
            .with_tokio()
            // Configure TCP transport with noise encryption and yamux multiplexing
            .with_tcp(
                tcp::Config::default(),
                noise::Config::new,
                yamux::Config::default,
            )?
            // Add the ping behavior
            .with_behaviour(|_| BasicBehaviour {
                ping: ping::Behaviour::default(),
            })?
            // Set the connection timeout
            .with_swarm_config(|cfg| cfg.with_idle_connection_timeout(Duration::from_secs(60)))
            .build();

        // Store the local peer ID for logging
        let peer_id = *swarm.local_peer_id();
        println!("Local peer id: {peer_id}");

        *swarm_lock = Some(swarm);
        Ok(())
    }

    // Start listening for incoming connections

    // Connect to a peer using their multiaddress
    pub async fn connect_to_peer(&self, addr: String) -> Result<(), Box<dyn Error>> {
        let mut swarm_lock = self.swarm.lock().await;
        let swarm = swarm_lock.as_mut().ok_or("Swarm not initialized")?;

        // Parse the multiaddress
        let remote: Multiaddr = addr.parse()?;

        // Attempt to dial the remote peer
        swarm.dial(remote.clone())?;
        println!("Dialing peer at: {}", remote);

        Ok(())
    }
    pub async fn get_listening_addresses(&self) -> Result<Vec<String>, Box<dyn Error>> {
        if !self.is_ready.load(Ordering::SeqCst) {
            return Err("P2P service not ready".into());
        }

        let addresses = self.listening_addresses.lock().await;
        if addresses.is_empty() {
            return Err("No listening addresses available".into());
        }

        Ok(addresses.clone())
    }
}
