use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng as AesOsRng},
    Aes256Gcm, Key as AesKey, Nonce,
};
use bip39::{Language, Mnemonic};
use ed25519_dalek::{SecretKey, Signer, SigningKey, Verifier, VerifyingKey, SECRET_KEY_LENGTH};
use hkdf::Hkdf;
use rand::{rngs::OsRng, RngCore};
use sha2::{Digest, Sha256, Sha512};
use x25519_dalek::{PublicKey as X25519PublicKey, StaticSecret};
use zeroize::Zeroize;

const MIN_NB_WORDS: usize = 12;
const MAX_NB_WORDS: usize = 24;

fn is_invalid_word_count(word_count: usize) -> bool {
    word_count < MIN_NB_WORDS || word_count % 3 != 0 || word_count > MAX_NB_WORDS
}

fn generate_mnemonic(word_count: usize) -> Result<Mnemonic, bip39::Error> {
    if is_invalid_word_count(word_count) {
        return Err(bip39::Error::BadWordCount(word_count));
    }
    let entropy_bytes = (word_count / 3) * 4;
    let mut entropy = vec![0u8; entropy_bytes];
    OsRng.fill_bytes(&mut entropy);
    Mnemonic::from_entropy_in(Language::English, &entropy)
}

fn derive_ed25519_signing_key(mnemonic: &Mnemonic) -> SigningKey {
    let seed = mnemonic.to_seed("");
    let hash = Sha512::digest(&seed);
    let secret_key: SecretKey = hash[..SECRET_KEY_LENGTH].try_into().unwrap();
    SigningKey::from_bytes(&secret_key)
}

fn derive_x25519_static_secret(mnemonic: &Mnemonic) -> StaticSecret {
    let seed = mnemonic.to_seed("");
    let hash = Sha512::digest(&seed);
    let secret_key: [u8; 32] = hash[SECRET_KEY_LENGTH..].try_into().unwrap();
    StaticSecret::from(secret_key)
}

fn generate_aes_key() -> AesKey<Aes256Gcm> {
    Aes256Gcm::generate_key(&mut AesOsRng)
}

fn encrypt_message(key: &AesKey<Aes256Gcm>, message: &[u8]) -> Vec<u8> {
    let cipher = Aes256Gcm::new(key);
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let ciphertext = cipher.encrypt(&nonce, message).unwrap();
    [nonce.as_slice(), &ciphertext].concat()
}

fn decrypt_message(key: &AesKey<Aes256Gcm>, encrypted_message: &[u8]) -> Vec<u8> {
    let cipher = Aes256Gcm::new(key);
    let nonce = Nonce::from_slice(&encrypted_message[..12]);
    cipher.decrypt(nonce, &encrypted_message[12..]).unwrap()
}

fn encrypt_aes_key(shared_secret: &[u8], aes_key: &AesKey<Aes256Gcm>) -> Vec<u8> {
    let mut hkdf = Hkdf::<Sha256>::new(None, shared_secret);
    let mut derived_key = [0u8; 32];
    hkdf.expand(b"AES key encryption", &mut derived_key)
        .unwrap();

    let cipher = Aes256Gcm::new(&derived_key.into());
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let ciphertext = cipher.encrypt(&nonce, aes_key.as_slice()).unwrap();
    [nonce.as_slice(), &ciphertext].concat()
}

fn decrypt_aes_key(shared_secret: &[u8], encrypted_aes_key: &[u8]) -> AesKey<Aes256Gcm> {
    let mut hkdf = Hkdf::<Sha256>::new(None, shared_secret);
    let mut derived_key = [0u8; 32];
    hkdf.expand(b"AES key encryption", &mut derived_key)
        .unwrap();

    let cipher = Aes256Gcm::new(&derived_key.into());
    let nonce = Nonce::from_slice(&encrypted_aes_key[..12]);
    let decrypted_key = cipher.decrypt(nonce, &encrypted_aes_key[12..]).unwrap();
    AesKey::<Aes256Gcm>::from_slice(&decrypted_key).clone()
}

fn main() {
    // Generate mnemonics for Alice and Bob
    let alice_mnemonic = generate_mnemonic(24).unwrap();
    let bob_mnemonic = generate_mnemonic(24).unwrap();

    // Derive X25519 keys for Alice and Bob
    let alice_secret = derive_x25519_static_secret(&alice_mnemonic);
    let alice_public = X25519PublicKey::from(&alice_secret);
    let bob_secret = derive_x25519_static_secret(&bob_mnemonic);
    let bob_public = X25519PublicKey::from(&bob_secret);

    // Generate shared secrets
    let alice_shared_secret = alice_secret.diffie_hellman(&bob_public);
    let bob_shared_secret = bob_secret.diffie_hellman(&alice_public);
    assert_eq!(alice_shared_secret.as_bytes(), bob_shared_secret.as_bytes());

    // Generate AES key
    let aes_key = generate_aes_key();

    // Alice encrypts the AES key
    let encrypted_aes_key = encrypt_aes_key(alice_shared_secret.as_bytes(), &aes_key);
    println!("Encrypted AES key: {:?}", encrypted_aes_key);

    // Bob decrypts the AES key
    let decrypted_aes_key = decrypt_aes_key(bob_shared_secret.as_bytes(), &encrypted_aes_key);
    assert_eq!(aes_key.as_slice(), decrypted_aes_key.as_slice());
    println!("AES key successfully decrypted!");

    // Use the AES key to encrypt and decrypt a message
    let message = b"Hello, Bob! Let's find our mittens!";
    let encrypted_message = encrypt_message(&aes_key, message);
    println!("Encrypted message: {:?}", encrypted_message);

    let decrypted_message = decrypt_message(&decrypted_aes_key, &encrypted_message);
    println!(
        "Decrypted message: {:?}",
        std::str::from_utf8(&decrypted_message).unwrap()
    );
}
