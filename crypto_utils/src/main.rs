// In main.rs

mod crypto_core;
mod errors;
mod types;

use crate::crypto_core::{
    decrypt_certificate, decrypt_message, encrypt_certificate, encrypt_for_multiple_recipients,
    generate_certificate, get_decryption_key, get_public_key_armored,
};
use crate::types::GeneratedKeys;
use openpgp::policy::StandardPolicy;
use sequoia_openpgp as openpgp;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Generate certificates for two users
    let alice_cert = generate_certificate("Alice")?;
    let bob_cert = generate_certificate("Bob")?;

    println!("Generated certificates for Alice and Bob");

    // Get public keys as strings
    let alice_public_key = get_public_key_armored(&alice_cert)?;
    let bob_public_key = get_public_key_armored(&bob_cert)?;

    // The message to encrypt
    let message = "Hello, this is a secret message for Alice and Bob!";

    // Encrypt the message for both recipients
    let encrypted_message = encrypt_for_multiple_recipients(
        message,
        &[alice_public_key.clone(), bob_public_key.clone()],
    )?;

    println!("Encrypted message:\n{}", encrypted_message);

    // Now let's decrypt the message using each certificate
    let policy = &StandardPolicy::new();

    for (name, cert) in [("Alice", &alice_cert), ("Bob", &bob_cert)] {
        let decrypt_key = get_decryption_key(cert)?;
        let decrypted_bytes = decrypt_message(policy, &decrypt_key, encrypted_message.as_bytes())?;
        let decrypted_message = String::from_utf8(decrypted_bytes)?;

        println!("\nDecrypted message for {}:\n{}", name, decrypted_message);

        assert_eq!(decrypted_message, message, "Decryption failed for {}", name);
    }

    println!("\nEncryption and decryption successful for both recipients!");

    Ok(())
}
