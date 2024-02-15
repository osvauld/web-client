
import browser from "webextension-polyfill";

import { decryptCredentialFields, deriveKeyFromPassphrase, encryptPvtKeyWithSymmerticKey, generateRandomString, decryptPvtKeys } from "../lib/utils/crypto";
import { intiateAuth, } from "../lib/utils/helperMethods";
import { Credential, CredentialFields } from "../lib/dtos/credential.dto";

import './wasm_exec.js'


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


export const savePassphraseHandler = async (passphrase: string, rsaPvtKey: string, eccPvtKey: string) => {

    const saltString = generateRandomString()
    await browser.storage.local.set({ passphraseSalt: saltString });
    const symmetricKey = await deriveKeyFromPassphrase(passphrase, saltString)
    const ivString = generateRandomString()
    await browser.storage.local.set({ passphraseIv: ivString });
    if (rsaPvtKey) {
        const pvtKeyCipher = await encryptPvtKeyWithSymmerticKey(symmetricKey, rsaPvtKey, ivString)
        await browser.storage.local.set({ encryptionPvtKey: pvtKeyCipher });
    }
    if (eccPvtKey) {
        const pvtKeyCipher = await encryptPvtKeyWithSymmerticKey(symmetricKey, eccPvtKey, ivString)
        await browser.storage.local.set({ signPvtKey: pvtKeyCipher });
    }
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
    // @ts-ignore
    const go = new Go(); // `Go` is defined in wasm_exec.js

    let wasmModuleInstance;

    async function loadWasm(filename) {
        if (!wasmModuleInstance) {
            const resp = await WebAssembly.instantiateStreaming(fetch(filename), go.importObject);
            wasmModuleInstance = resp.instance;
            go.run(wasmModuleInstance);
        }
    }

    async function init() {
        await loadWasm('main.wasm'); // Load and initialize the WASM module
    }

    init().then(() => {
        console.log('WASM Module Loaded');
        // Now you can call the Go functions that have been exposed to JavaScript
        // Example usage:
        // Assuming the add function has been made globally available by the Go code
        // @ts-ignore
        const result = window.generateKeys('abraham', 'abrahamgeore');
        console.log(`Result from Go: ${JSON.stringify(result)}`); // This might need adjustment based on how the function is actually exposed
        // @ts-ignore
        const result2 = window.generateKeys('abraham', 'abrahamgeore');

        console.log(`Result from Go: ${JSON.stringify(result2)}`); // This might need adjustment based on how the function is actually exposed
    });
};