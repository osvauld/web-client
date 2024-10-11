use anyhow::Result;
use openpgp::cert::prelude::*;
use openpgp::crypto::{KeyPair, SessionKey};
use openpgp::parse::stream::{DecryptionHelper, DecryptorBuilder, VerificationHelper};
use openpgp::parse::Parse;
use openpgp::policy::StandardPolicy;
use openpgp::serialize::stream::{Encryptor2, LiteralWriter, Message};
use openpgp::types::KeyFlags;
use openpgp::types::SymmetricAlgorithm;
use sequoia_openpgp as openpgp;
use std::io::{Read, Write};

fn multi_recipient_encryption_poc() -> Result<()> {
    let p = &StandardPolicy::new();

    // Generate two certificates
    println!("Generating two certificates...");
    let (cert1, _) = CertBuilder::new()
        .add_userid("Alice <alice@example.org>")
        .add_transport_encryption_subkey()
        .generate()?;
    let (cert2, _) = CertBuilder::new()
        .add_userid("Bob <bob@example.org>")
        .add_transport_encryption_subkey()
        .generate()?;
    println!("Certificates generated.");

    // Collect recipients
    let recipients: Vec<_> = vec![&cert1, &cert2]
        .into_iter()
        .flat_map(|cert| {
            cert.keys()
                .with_policy(p, None)
                .supported()
                .alive()
                .revoked(false)
                .for_transport_encryption()
                .map(|ka| ka.key())
        })
        .collect();

    // Encrypt
    let mut ciphertext = Vec::new();
    {
        let message = Message::new(&mut ciphertext);
        let message = Encryptor2::for_recipients(message, recipients).build()?;
        let mut w = LiteralWriter::new(message).build()?;
        w.write_all(b"Hello, world!")?;
        w.finalize()?;
    }

    println!("Message encrypted.");

    // Closure to decrypt
    let decrypt_message = |cert: &Cert| -> Result<Vec<u8>> {
        struct Helper<'a>(&'a Cert);

        impl VerificationHelper for Helper<'_> {
            fn get_certs(&mut self, _ids: &[openpgp::KeyHandle]) -> Result<Vec<Cert>> {
                Ok(Vec::new())
            }
            fn check(
                &mut self,
                _structure: openpgp::parse::stream::MessageStructure,
            ) -> Result<()> {
                Ok(())
            }
        }

        impl DecryptionHelper for Helper<'_> {
            fn decrypt<D>(
                &mut self,
                pkesks: &[openpgp::packet::PKESK],
                _skesks: &[openpgp::packet::SKESK],
                sym_algo: Option<SymmetricAlgorithm>,
                mut decrypt: D,
            ) -> Result<Option<openpgp::Fingerprint>>
            where
                D: FnMut(SymmetricAlgorithm, &SessionKey) -> bool,
            {
                let keypair = self
                    .0
                    .keys()
                    .with_policy(p, None)
                    .supported()
                    .alive()
                    .revoked(false)
                    .for_transport_encryption()
                    .secret()
                    .next()
                    .unwrap()
                    .key()
                    .clone()
                    .into_keypair()?;

                for pkesk in pkesks {
                    let mut pair = keypair.clone();
                    if let Some((algo, session_key)) = pkesk.decrypt(&mut pair, sym_algo) {
                        if decrypt(algo, &session_key) {
                            return Ok(Some(self.0.fingerprint()));
                        }
                    }
                }
                Ok(None)
            }
        }

        let mut plaintext = Vec::new();
        let helper = Helper(cert);
        let mut reader = DecryptorBuilder::from_bytes(&ciphertext)?.with_policy(p, None, helper)?;
        reader.read_to_end(&mut plaintext)?;
        Ok(plaintext)
    };

    // Decrypt with first certificate
    println!("Decrypting with first certificate...");
    let plaintext1 = decrypt_message(&cert1)?;
    println!(
        "Decrypted with cert1: {}",
        String::from_utf8_lossy(&plaintext1)
    );

    // Decrypt with second certificate
    println!("Decrypting with second certificate...");
    let plaintext2 = decrypt_message(&cert2)?;
    println!(
        "Decrypted with cert2: {}",
        String::from_utf8_lossy(&plaintext2)
    );

    // Verify results
    assert_eq!(plaintext1, b"Hello, world!");
    assert_eq!(plaintext2, b"Hello, world!");
    println!("Assertion passed: Both decrypted texts match the original!");

    Ok(())
}

fn main() -> Result<()> {
    multi_recipient_encryption_poc()
}
