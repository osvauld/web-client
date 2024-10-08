use crate::DbConnection;
use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use openssl::pkey::PKey;
use openssl::ssl::{SslAcceptor, SslMethod};
use openssl::x509::X509;
use rcgen::generate_simple_self_signed;
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct AppState {
    pub db_connection: Arc<Mutex<DbConnection>>,
}

async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello from Tauri local HTTP/2 server!")
}

fn generate_self_signed_cert() -> (X509, PKey<openssl::pkey::Private>) {
    let subject_alt_names = vec!["localhost".to_string()];
    let cert = generate_simple_self_signed(subject_alt_names).unwrap();

    let cert_pem = cert.serialize_pem().unwrap();
    let key_pem = cert.serialize_private_key_pem();

    let x509 = X509::from_pem(cert_pem.as_bytes()).unwrap();
    let pkey = PKey::private_key_from_pem(key_pem.as_bytes()).unwrap();

    (x509, pkey)
}

pub async fn run_server(db_connection: DbConnection) -> std::io::Result<()> {
    let app_state = web::Data::new(AppState {
        db_connection: Arc::new(Mutex::new(db_connection)),
    });

    // Generate self-signed certificate
    let (cert, key) = generate_self_signed_cert();

    let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    builder.set_private_key(&key).unwrap();
    builder.set_certificate(&cert).unwrap();

    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .route("/", web::get().to(hello))
    })
    .bind_openssl("127.0.0.1:8080", builder)?
    .run()
    .await
}
