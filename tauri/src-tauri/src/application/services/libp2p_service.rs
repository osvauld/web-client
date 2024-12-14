use futures::{executor::block_on, future::FutureExt, stream::StreamExt};
use futures_timer;
use libp2p::{
    core::multiaddr::{Multiaddr, Protocol},
    dcutr,
    dns::{ResolverConfig, ResolverOpts},
    identify, identity, noise, ping, relay,
    swarm::{NetworkBehaviour, SwarmEvent},
    tcp, yamux, PeerId,
};
use log::{error, info};
use std::{error::Error, time::Duration};

#[derive(Clone, Debug, PartialEq)]
pub enum Mode {
    Listen,
    Dial,
}

#[derive(NetworkBehaviour)]
struct Behaviour {
    relay_client: relay::client::Behaviour,
    ping: ping::Behaviour,
    identify: identify::Behaviour,
    dcutr: dcutr::Behaviour,
}

pub async fn handle_p2p_connection(
    mode: bool,
    circuit_address: Option<String>,
) -> Result<(), Box<dyn Error>> {
    // Create the swarm, exactly like the example

    let local_key = identity::Keypair::generate_ed25519();
    let peer_id = PeerId::from(local_key.public());
    info!("Local peer id: {}", peer_id);

    let mut swarm = libp2p::SwarmBuilder::with_existing_identity(local_key)
        .with_tokio()
        .with_tcp(
            tcp::Config::default().nodelay(true),
            noise::Config::new,
            yamux::Config::default,
        )?
        .with_quic()
        .with_dns_config(ResolverConfig::google(), ResolverOpts::default())
        .with_relay_client(noise::Config::new, yamux::Config::default)?
        .with_behaviour(|keypair, relay_behaviour| Behaviour {
            relay_client: relay_behaviour,
            ping: ping::Behaviour::new(ping::Config::new()),
            identify: identify::Behaviour::new(identify::Config::new(
                "/TODO/0.0.1".to_string(),
                keypair.public(),
            )),
            dcutr: dcutr::Behaviour::new(keypair.public().to_peer_id()),
        })?
        .build();
    // Initial listening setup, exactly matching example
    swarm
        .listen_on("/ip4/0.0.0.0/tcp/0".parse().unwrap())
        .unwrap();

    swarm
        .listen_on("/ip4/0.0.0.0/udp/0/quic-v1".parse().unwrap())
        .unwrap();
    block_on(async {
        let mut delay = futures_timer::Delay::new(std::time::Duration::from_secs(1)).fuse();
        loop {
            futures::select! {
                event = swarm.next() => {
                    match event.unwrap() {
                        SwarmEvent::NewListenAddr { address, .. } => {
                            info!( "Listening on address");
                        }
                        event => panic!("{event:?}"),
                    }
                }
                _ = delay => {
                    // Likely listening on all interfaces now, thus continuing by breaking the loop.
                    break;
                }
            }
        }
    });
    // Connect to relay and wait for identification, exactly like example
    let relay_addr: Multiaddr =
        "/ip4/40.90.176.32/tcp/2700/p2p/12D3KooWDpJ7As7BWAwRMfu1VU2WCqNjvq387JEYKDBj4kx6nXTN"
            .parse()?;
    swarm.dial(relay_addr.clone())?;

    let mut learned_observed_addr = false;
    let mut told_relay_observed_addr = false;

    while !learned_observed_addr || !told_relay_observed_addr {
        match swarm.next().await.unwrap() {
            SwarmEvent::NewListenAddr { .. } => {}
            SwarmEvent::Dialing { .. } => {}
            SwarmEvent::ConnectionEstablished { .. } => {}
            SwarmEvent::Behaviour(BehaviourEvent::Ping(_)) => {
                info!("Ping event");
            }
            SwarmEvent::Behaviour(BehaviourEvent::Identify(identify::Event::Sent { .. })) => {
                info!("Told relay its public address");
                told_relay_observed_addr = true;
            }
            SwarmEvent::Behaviour(BehaviourEvent::Identify(identify::Event::Received {
                ..
            })) => {
                info!("Learned our observed address");
                learned_observed_addr = true;
            }
            _ => {}
        }
    }

    if mode {
        info!("Dialing relay with circuit address");
        let addr: PeerId = circuit_address.unwrap().parse()?;

        // Log the components
        info!("Relay address: {}", relay_addr);
        info!("Target peer ID: {}", addr);

        // Construct and log the full circuit address
        let full_circuit_addr = relay_addr
            .clone()
            .with(Protocol::P2pCircuit)
            .with(Protocol::P2p(addr));

        info!("Full circuit address being dialed: {}", full_circuit_addr);

        // Attempt the dial
        match swarm.dial(full_circuit_addr) {
            Ok(_) => info!("Successfully initiated dial"),
            Err(e) => error!("Failed to initiate dial: {}", e),
        }
    } else {
        info!("Listening for incoming connections");
        swarm
            .listen_on(relay_addr.with(Protocol::P2pCircuit))
            .unwrap();
    }

    info!("Entering main event loop");
    // Main event loop, exactly like example
    loop {
        match swarm.next().await.unwrap() {
            SwarmEvent::NewListenAddr { address, .. } => {
                info!("Listening on {}", address);
            }
            SwarmEvent::Behaviour(BehaviourEvent::RelayClient(
                relay::client::Event::ReservationReqAccepted { .. },
            )) => {
                if mode {
                    info!("Relay accepted our reservation request");
                }
            }
            SwarmEvent::Behaviour(BehaviourEvent::RelayClient(event)) => {
                info!("Relay event: {:?}", event);
            }
            SwarmEvent::Behaviour(BehaviourEvent::Dcutr(event)) => {
                info!("DCUtR event: {:?}", event);
            }
            SwarmEvent::Behaviour(BehaviourEvent::Identify(event)) => {
                info!("Identify event: {:?}", event);
            }
            SwarmEvent::Behaviour(BehaviourEvent::Ping(_)) => {}
            SwarmEvent::ConnectionEstablished {
                peer_id, endpoint, ..
            } => {
                info!(
                    "Established connection with {}______________________________________________",
                    peer_id
                );
            }
            SwarmEvent::OutgoingConnectionError { peer_id, error, .. } => {
                info!("Failed to connect to {:?}: {}", peer_id, error);
            }
            _ => {}
        }
    }
}
