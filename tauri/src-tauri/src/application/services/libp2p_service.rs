use libp2p::{
    core::multiaddr::Protocol,
    futures::StreamExt,
    identity, noise, ping,
    swarm::{NetworkBehaviour, SwarmEvent},
    tcp, yamux, Multiaddr, PeerId, SwarmBuilder,
};
use log::info;
use std::result::Result::Ok;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::{error::Error, time::Duration};
use tauri::{AppHandle, Emitter};
use tokio::sync::mpsc;
use tokio::sync::oneshot;
use tokio::sync::Mutex;

// Define the core behavior for our P2P network
#[derive(NetworkBehaviour)]
struct BasicBehaviour {
    // Ping protocol for connection liveness
    ping: ping::Behaviour,
}

#[derive(Debug)]
enum SwarmCommand {
    // Include a response channel with each command
    Dial {
        addr: Multiaddr,
        response_sender: oneshot::Sender<Result<(), Box<dyn Error + Send + 'static>>>,
    },
}

pub struct LibP2PService {
    app_handle: AppHandle,
    swarm: Arc<Mutex<Option<libp2p::Swarm<BasicBehaviour>>>>,
    is_ready: Arc<AtomicBool>,
    listening_addresses: Arc<Mutex<Vec<String>>>,
    command_sender: mpsc::Sender<SwarmCommand>,
    command_receiver: Arc<Mutex<mpsc::Receiver<SwarmCommand>>>,
}

impl LibP2PService {
    pub fn new(app_handle: AppHandle) -> Self {
        let (sender, receiver) = mpsc::channel(32);
        Self {
            app_handle,
            swarm: Arc::new(Mutex::new(None)),
            is_ready: Arc::new(AtomicBool::new(false)),
            listening_addresses: Arc::new(Mutex::new(Vec::new())),
            command_sender: sender,
            command_receiver: Arc::new(Mutex::new(receiver)),
        }
    }

    pub async fn initialize(&self) -> Result<(), Box<dyn Error>> {
        let mut swarm_lock = self.swarm.lock().await;

        // If already initialized, just return
        if swarm_lock.is_some() {
            return Ok(());
        }

        println!("Creating new swarm...");
        let swarm = libp2p::SwarmBuilder::with_new_identity()
            .with_tokio()
            .with_tcp(
                tcp::Config::default(),
                noise::Config::new,
                yamux::Config::default,
            )?
            .with_behaviour(|_| BasicBehaviour {
                ping: ping::Behaviour::default(),
            })?
            .with_swarm_config(|cfg| cfg.with_idle_connection_timeout(Duration::from_secs(60)))
            .build();

        println!("Local peer id: {}", swarm.local_peer_id());
        *swarm_lock = Some(swarm);

        Ok(())
    }

    async fn handle_swarm_events(&self) -> Result<(), Box<dyn Error>> {
        loop {
            let event = {
                let mut swarm_lock = self.swarm.lock().await;
                println!("Got swarm lock in event loop");

                match swarm_lock.as_mut() {
                    Some(swarm) => {
                        let mut receiver = self.command_receiver.lock().await;
                        println!("Got command receiver lock");

                        tokio::select! {
                            event = swarm.next() => {
                                println!("Got swarm event: {:?}", event);
                                event
                            },
                            command = receiver.recv() => {
                                println!("Received command: {:?}", command);
                                match command {
                                    Some(SwarmCommand::Dial { addr, response_sender }) => {
                                        println!("Processing dial command for address: {:?}", addr);
                                        let result = match swarm.dial(addr.clone()) {
                                            Ok(()) => {
                                                println!("Dial successful");
                                                Ok(())
                                            },
                                            Err(e) => {
                                                println!("Dial failed: {}", e);
                                                Err(Box::new(e) as Box<dyn Error + Send + 'static>)
                                            },
                                        };
                                        if let Err(e) = response_sender.send(result) {
                                            println!("Failed to send dial result: {:?}", e);
                                        }
                                    },
                                    None => {
                                        println!("Command channel closed");
                                        break Ok(());
                                    }
                                }
                                continue;
                            }
                        }
                    }
                    None => {
                        println!("Swarm is None in event loop");
                        break Ok(());
                    }
                }
            };

            // Handle network events as before
            match event {
                Some(SwarmEvent::NewListenAddr { address, .. }) => {
                    println!("New listen address: {:?}", address);
                    let swarm_lock = self.swarm.lock().await;
                    if let Some(swarm) = swarm_lock.as_ref() {
                        let mut full_addr = address.clone();
                        full_addr.push(Protocol::P2p((*swarm.local_peer_id()).into()));

                        println!("Full address with peer ID: {:?}", full_addr);
                        let mut addr_lock = self.listening_addresses.lock().await;
                        addr_lock.push(full_addr.to_string());
                        let _ = self
                            .app_handle
                            .emit("listening-address", full_addr.to_string());
                    }

                    if !self.is_ready.load(Ordering::SeqCst) {
                        self.is_ready.store(true, Ordering::SeqCst);
                    }
                }

                Some(SwarmEvent::ConnectionEstablished { peer_id, .. }) => {
                    println!("Connected to peer: {:?}", peer_id);
                    let _ = self.app_handle.emit("peer-connected", peer_id.to_string());
                }

                Some(SwarmEvent::ConnectionClosed { peer_id, .. }) => {
                    println!("Disconnected from peer: {:?}", peer_id);
                    let _ = self
                        .app_handle
                        .emit("peer-disconnected", peer_id.to_string());
                }

                Some(SwarmEvent::Behaviour(BasicBehaviourEvent::Ping(ping::Event {
                    peer,
                    result,
                    ..
                }))) => match result {
                    Ok(duration) => println!("Ping to {:?} took {:?}", peer, duration),
                    Err(err) => println!("Ping to {:?} failed: {:?}", peer, err),
                },

                Some(event) => println!("Other event: {:?}", event),
                None => break Ok(()),
            }
        }
    }

    pub async fn start_listening(&self) -> Result<(), Box<dyn Error>> {
        // First potential issue: We check ready state before initialization
        if self.is_ready.load(Ordering::SeqCst) {
            return Ok(());
        }

        // Let's add logging here
        println!("Starting listening process...");

        self.initialize().await?;
        println!("Initialization complete. Swarm created.");

        let mut swarm_lock = self.swarm.lock().await;
        println!("Acquired swarm lock");

        let swarm = swarm_lock.as_mut().ok_or("Swarm not initialized")?;
        println!("Got mutable reference to swarm");

        // Start listening on all interfaces with a random port
        match swarm.listen_on("/ip4/0.0.0.0/tcp/0".parse()?) {
            Ok(_) => println!("Successfully started listening on all interfaces"),
            Err(e) => println!("Failed to start listening: {}", e),
        }

        // Important: Drop the lock before entering the event loop
        println!("Dropping swarm lock before event handling");
        drop(swarm_lock);

        // Let's add logging in the event handling loop
        println!("Starting event handling loop");
        match self.handle_swarm_events().await {
            Ok(_) => println!("Event loop completed successfully"),
            Err(e) => println!("Event loop error: {}", e),
        }

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

    pub async fn connect_to_peer(&self, addr: String) -> Result<(), Box<dyn Error>> {
        info!("Attempting to connect to: {}", addr);
        let remote: Multiaddr = addr.parse()?;
        if !self.is_ready.load(Ordering::SeqCst) {
            info!("Initializing P2P service...");
            self.initialize().await?;
            self.start_listening().await?;
        }

        // Create a one-shot channel for receiving the connection result
        let (response_sender, response_receiver) = oneshot::channel();

        // Send the dial command along with the response channel
        self.command_sender
            .send(SwarmCommand::Dial {
                addr: remote,
                response_sender,
            })
            .await
            .map_err(|e| Box::new(e) as Box<dyn Error>)?;

        // Handle the response with proper error conversion
        match response_receiver.await {
            Ok(Ok(())) => Ok(()),
            Ok(Err(e)) => Err(Box::new(std::io::Error::new(
                std::io::ErrorKind::Other,
                e.to_string(),
            )) as Box<dyn Error>),
            Err(e) => Err(Box::new(std::io::Error::new(
                std::io::ErrorKind::Other,
                e.to_string(),
            )) as Box<dyn Error>),
        }
    }
}
