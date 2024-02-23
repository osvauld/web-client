
import browser from "webextension-polyfill";

import { decryptCredentialFields, deriveKeyFromPassphrase, encryptPvtKeyWithSymmerticKey, generateRandomString, decryptPvtKeys } from "../lib/utils/crypto";
import { intiateAuth, } from "../lib/utils/helperMethods";
import { finalRegistration } from '../lib/apis/auth.api.js';
import { Credential, CredentialFields } from "../lib/dtos/credential.dto";
// @ts-ignore
import init, { generate_and_encrypt_keys, encrypt_messages, decrypt_messages, sign_message } from './rust_openpgp_wasm.js';

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

    const saltObj = await browser.storage.local.get('passphraseSalt');
    const symmetricKey = await deriveKeyFromPassphrase(passphrase, saltObj.passphraseSalt)
    const ivObj = await browser.storage.local.get('passphraseIv');
    const signPvtKeyObj = await browser.storage.local.get("signPvtKey");
    const encryptionPvtKeyObj = await browser.storage.local.get("encryptionPvtKey");
    const decryptedKeys = await decryptPvtKeys(symmetricKey, signPvtKeyObj.signPvtKey, encryptionPvtKeyObj.encryptionPvtKey, ivObj.passphraseIv);
    const rsaPvtKey = decryptedKeys.rsaPvtKey;
    const eccPvtKey = decryptedKeys.eccPvtKey;
    const token = await intiateAuth(eccPvtKey).catch((err) => {
        console.error(err);
    });
    if (token) {
        await browser.storage.local.set({ token: token });
        await browser.storage.local.set({ isLoggedIn: true });

    }
    return { token, rsaPvtKey, eccPvtKey }
}


export const savePassphraseHandler = async (passphrase: string, challenge: string, username: string) => {
    await init();
    const keyPair = await generate_and_encrypt_keys(passphrase);
    await browser.storage.local.set({ encryptionPvtKey: keyPair.get('enc_private_key'), signPvtKey: keyPair.get('sign_private_key') });
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







export const loadWasmModule = async () => {
    try {
        await init();
        const keyPair = await generate_and_encrypt_keys('test');

        console.log(keyPair.get('enc_public_key'))

        // Function to generate a random text string
        const generateRandomText = (length) => {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        };
        const resposne2 = await sign_message(keyPair.get('sign_private_key'), 'test', 'test22')
        console.log(resposne2, 'challenge')
        // const plaintexts = Array.from({ length: 1 }, () => generateRandomText(100)); // Generate 100 random texts
        // // Call the Rust function to print encryption times
        // const start = performance.now();
        // const response = await encrypt_messages(keyPair.get('enc_public_key'), plaintexts);
        // console.log("Time to generate 10000 encrypted texts:", performance.now() - start, "ms");

        // const start2 = performance.now();
        // await decrypt_messages(keyPair.get('enc_private_key'), response, 'test');
        // console.log("Time to decrypt 10000 encrypted texts:", performance.now() - start2, "ms");

    } catch (error) {
        console.error("Error loading WASM module or processing encryption/decryption:", error);
    }
};