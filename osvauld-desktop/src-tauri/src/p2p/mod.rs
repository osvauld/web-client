use anyhow::Result;
use libp2p::futures::StreamExt;
use libp2p::{
    core::muxing::StreamMuxerBox,
    core::Transport,
    multiaddr::{Multiaddr, Protocol},
    ping,
    swarm::SwarmEvent,
};
use libp2p_webrtc as webrtc;
use log::{debug, error, info};
use rand::thread_rng;
use std::{
    net::{IpAddr, Ipv4Addr, SocketAddr},
    sync::Arc,
    time::Duration,
};
use stun::{agent::*, client::*, message::*, xoraddr::*};
use tokio::net::UdpSocket;
use tokio::sync::Mutex;

pub struct P2PManager {
    swarm: Arc<Mutex<libp2p::Swarm<ping::Behaviour>>>,
    address: Option<Multiaddr>,
    public_addr: Option<SocketAddr>,
}

struct StunSocketAddr(XorMappedAddress);

impl StunSocketAddr {
    fn into_socket_addr(self) -> SocketAddr {
        SocketAddr::new(self.0.ip, self.0.port)
    }
}

impl P2PManager {
    pub async fn new() -> Result<Self> {
        let mut swarm = libp2p::SwarmBuilder::with_new_identity()
            .with_tokio()
            .with_other_transport(|id_keys| {
                Ok(webrtc::tokio::Transport::new(
                    id_keys.clone(),
                    webrtc::tokio::Certificate::generate(&mut thread_rng())?,
                )
                .map(|(peer_id, conn), _| (peer_id, StreamMuxerBox::new(conn))))
            })?
            .with_behaviour(|_| ping::Behaviour::default())?
            .with_swarm_config(|cfg| {
                cfg.with_idle_connection_timeout(Duration::from_secs(u64::MAX))
            })
            .build();

        let address_webrtc = Multiaddr::empty()
            .with(Protocol::Ip4(Ipv4Addr::UNSPECIFIED))
            .with(Protocol::Udp(0))
            .with(Protocol::WebRTCDirect);

        swarm.listen_on(address_webrtc)?;

        Ok(Self {
            swarm: Arc::new(Mutex::new(swarm)),
            address: None,
            public_addr: None,
        })
    }

    pub async fn get_public_address(&mut self) -> Result<SocketAddr> {
        let stun_servers = [
            "stun.l.google.com:19302",
            "stun1.l.google.com:19302",
            "stun2.l.google.com:19302",
        ];

        for &server in &stun_servers {
            match self.query_stun_server(server).await {
                Ok(addr) => {
                    info!("Got public address {} from STUN server {}", addr, server);
                    self.public_addr = Some(addr);
                    return Ok(addr);
                }
                Err(e) => {
                    error!("Failed to get address from STUN server {}: {}", server, e);
                    continue;
                }
            }
        }

        Err(anyhow::anyhow!("All STUN servers failed"))
    }

    async fn query_stun_server(&self, server: &str) -> Result<SocketAddr> {
        // Create a UDP socket
        let conn = UdpSocket::bind("0.0.0.0:0").await?;
        info!("Local address: {}", conn.local_addr()?);
        info!("Connecting to STUN server: {}", server);

        conn.connect(server).await?;

        let (handler_tx, mut handler_rx) = tokio::sync::mpsc::unbounded_channel();

        let mut client = ClientBuilder::new().with_conn(Arc::new(conn)).build()?;

        let mut msg = Message::new();
        msg.build(&[Box::<TransactionId>::default(), Box::new(BINDING_REQUEST)])?;

        client.send(&msg, Some(Arc::new(handler_tx))).await?;

        if let Some(event) = handler_rx.recv().await {
            let msg = event.event_body?;
            let mut xor_addr = XorMappedAddress::default();
            xor_addr.get_from(&msg)?;

            let socket_addr: SocketAddr = StunSocketAddr(xor_addr).into_socket_addr();
            info!("STUN response: {}", socket_addr);

            client.close().await?;
            Ok(socket_addr)
        } else {
            Err(anyhow::anyhow!("No response from STUN server"))
        }
    }

    pub async fn get_connection_info(&mut self) -> Result<ConnectionInfo> {
        let local_addr = self
            .get_address()
            .ok_or_else(|| anyhow::anyhow!("Local address not available"))?;

        let public_addr = if let Some(addr) = self.public_addr {
            addr
        } else {
            self.get_public_address().await?
        };

        let certhash = local_addr
            .iter()
            .find_map(|proto| {
                if let Protocol::Certhash(hash) = proto {
                    Some(hash.clone())
                } else {
                    None
                }
            })
            .ok_or_else(|| anyhow::anyhow!("Certhash not found in local address"))?;

        let public_multiaddr = match public_addr.ip() {
            IpAddr::V4(ipv4) => Multiaddr::empty()
                .with(Protocol::Ip4(ipv4))
                .with(Protocol::Udp(public_addr.port())),
            IpAddr::V6(ipv6) => Multiaddr::empty()
                .with(Protocol::Ip6(ipv6))
                .with(Protocol::Udp(public_addr.port())),
        }
        .with(Protocol::WebRTCDirect)
        .with(Protocol::Certhash(certhash))
        .with(Protocol::P2p(*self.swarm.lock().await.local_peer_id()));

        Ok(ConnectionInfo {
            local_address: local_addr,
            public_address: public_multiaddr,
            public_socket: public_addr,
            peer_id: self.swarm.lock().await.local_peer_id().to_string(),
        })
    }

    pub async fn start_listening(&mut self) -> Result<Multiaddr> {
        let mut swarm = self.swarm.lock().await;

        let address = loop {
            match swarm.select_next_some().await {
                SwarmEvent::NewListenAddr { address, .. } => {
                    if !address
                        .iter()
                        .any(|p| matches!(p, Protocol::Ip4(addr) if addr == Ipv4Addr::LOCALHOST))
                    {
                        info!("Listening on {}", address);
                        break address;
                    }
                    debug!("Ignoring localhost address");
                }
                evt => debug!("Other event during listen: {:?}", evt),
            }
        };

        let addr = address.with(Protocol::P2p(*swarm.local_peer_id()));
        self.address = Some(addr.clone());
        Ok(addr)
    }

    pub async fn run_event_loop(&self) {
        let mut swarm = self.swarm.lock().await;

        loop {
            match swarm.select_next_some().await {
                SwarmEvent::Behaviour(ping::Event { peer, result, .. }) => match result {
                    Ok(rtt) => info!("Ping success from {}: {:?}", peer, rtt),
                    Err(e) => error!("Ping failure from {}: {:?}", peer, e),
                },
                SwarmEvent::ConnectionEstablished { peer_id, .. } => {
                    info!("Connected to peer: {}", peer_id);
                }
                SwarmEvent::ConnectionClosed { peer_id, cause, .. } => {
                    info!("Disconnected from peer: {} (cause: {:?})", peer_id, cause);
                }
                evt => debug!("Other event: {:?}", evt),
            }
        }
    }

    pub async fn connect_to_peer(&self, peer_addr: Multiaddr) -> Result<()> {
        let mut swarm = self.swarm.lock().await;
        info!("Attempting to connect to peer: {}", peer_addr);
        swarm.dial(peer_addr)?;
        Ok(())
    }

    pub fn get_address(&self) -> Option<Multiaddr> {
        self.address.clone()
    }
}

#[derive(Debug, Clone)]
pub struct ConnectionInfo {
    pub local_address: Multiaddr,
    pub public_address: Multiaddr,
    pub public_socket: SocketAddr,
    pub peer_id: String,
}
pub async fn initialize_p2p() -> Result<P2PManager> {
    // Return P2PManager directly
    info!("Initializing P2P manager");
    let mut p2p_manager = P2PManager::new().await?;
    let addr = p2p_manager.start_listening().await?;
    info!("P2P manager listening on local address: {}", addr);

    // Get both local and public addresses
    let connection_info = p2p_manager.get_connection_info().await?;
    info!("Local address: {}", connection_info.local_address);
    info!("Public address: {}", connection_info.public_address);
    info!("Public socket: {}", connection_info.public_socket);
    info!("Peer ID: {}", connection_info.peer_id);

    Ok(p2p_manager)
}
