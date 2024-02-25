
import browser from "webextension-polyfill";

import { decryptCredentialFields, deriveKeyFromPassphrase, encryptPvtKeyWithSymmerticKey, generateRandomString, decryptPvtKeys } from "../lib/utils/crypto";
import { intiateAuth, } from "../lib/utils/helperMethods";
import { createChallenge, finalRegistration, initiateAuth } from '../lib/apis/auth.api.js';
import { Credential, CredentialFields } from "../lib/dtos/credential.dto";
// @ts-ignore
import init, { generate_and_encrypt_keys, encrypt_messages, decrypt_messages, sign_message, decrypt_and_store_keys, sign_message_with_stored_key, encrypt_new_credential } from './rust_openpgp_wasm.js';

export const decryptCredentialFieldsHandler = async (credentials: CredentialFields[], rsaPvtKey: CryptoKey) => {

    const returnPayload: CredentialFields[] = [];
    for (const credential of credentials) {
        const decryptedFields: any = await decryptCredentialFields(credential.fields, rsaPvtKey);

        console.log(decryptedFields)
        const payload: CredentialFields = {
            credentialId: credential.credentialId,
            fields: [...decryptedFields]
        }
        returnPayload.push(payload)
    }
    return { data: returnPayload };

}


export const initiateAuthHandler = async (passphrase: string) => {

    const encryptionPvtKeyObj = await browser.storage.local.get("encryptionPvtKey");
    const signPvtKeyObj = await browser.storage.local.get("signPvtKey");
    const encryptionKey = encryptionPvtKeyObj.encryptionPvtKey;
    const signKey = signPvtKeyObj.signPvtKey;
    const startTime = performance.now();
    const cacheObj = decrypt_and_store_keys(encryptionKey, signKey, passphrase);
    const pubKeyObj = await browser.storage.local.get('signPublicKey');
    console.log("Time taken to decrypt and store keys:", performance.now() - startTime);
    const challengeResponse = await createChallenge(pubKeyObj.signPublicKey);
    await cacheObj;
    console.log(challengeResponse);
    const signedMessage = await sign_message_with_stored_key(challengeResponse.data.challenge);
    console.log(signedMessage);
    const verificationResponse = await initiateAuth(signedMessage, pubKeyObj.signPublicKey);
    console.log(verificationResponse);
    const token = verificationResponse.data.token;
    if (token) {
        await browser.storage.local.set({ token: token });
        await browser.storage.local.set({ isLoggedIn: true });
    }
    return token;
}


export const savePassphraseHandler = async (passphrase: string, challenge: string, username: string) => {
    await init();
    const keyPair = await generate_and_encrypt_keys(passphrase);
    console.log(keyPair)
    await browser.storage.local.set({ encryptionPvtKey: keyPair.get('enc_private_key'), signPvtKey: keyPair.get('sign_private_key'), encPublicKey: keyPair.get('enc_public_key'), signPublicKey: keyPair.get('sign_public_key') });
    const signature = await sign_message(keyPair.get('sign_private_key'), passphrase, challenge)
    await finalRegistration(username, signature, keyPair.get('sign_public_key'), keyPair.get('enc_public_key'))
    return { isSaved: true }
}

export const decryptCredentialFieldsHandlerNew = async (credentials: Credential[], rsaPvtKey: CryptoKey) => {

    const returnPayload: Credential[] = [];
    for (const credential of credentials) {
        const decryptedFields = await decryptCredentialFields(credential.fields, rsaPvtKey);
        const payload: Credential = {
            ...credential,
            fields: decryptedFields
        }
        returnPayload.push(payload)
    }
    return { data: returnPayload };
}

export const addCredentialHandler = async (payload) => {
    try {

        console.log(payload.users)
        console.log(payload.addCredentialFields)
        return await encrypt_new_credential(payload.users, payload.addCredentialFields)

    } catch (error) {

        console.error("Error adding credential:", error);
    }

}







export const loadWasmModule = async () => {
    try {
        await init();
    } catch (error) {
        console.error("Error loading WASM module or processing encryption/decryption:", error);
    }
};