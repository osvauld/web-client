

import { createChallenge, finalRegistration, initiateAuth } from '../lib/apis/auth.api.js';
import { Credential, CredentialFields } from "../lib/dtos/credential.dto";
import init, { generate_and_encrypt_keys, sign_message, decrypt_and_store_keys, sign_message_with_stored_key, encrypt_new_credential, decrypt_credentials, decrypt_text, decrypt_fields, encrypt_fields, get_pub_key, } from './rust_openpgp_wasm.js';
import browser from "webextension-polyfill";

type CredentialsForUsersPayload = {
    accessType?: string;
    userId: string;
    credentials: CredentialFields[];
}
type UserListForEncryption = { id: string, publicKey: string, accessType?: string };

export const decryptCredentialFieldsHandler = async (credentials: CredentialFields[]) => {

    try {
        const response = await decrypt_fields(credentials)
        return { data: response };
    } catch (error) {
        console.error("Error decrypting credentials:", error);
    }


}


export const initiateAuthHandler = async (passphrase: string) => {


    const encryptionPvtKeyObj = await browser.storage.local.get("encryptionPvtKey");
    const signPvtKeyObj = await browser.storage.local.get("signPvtKey");
    const encryptionKey = encryptionPvtKeyObj.encryptionPvtKey;
    const signKey = signPvtKeyObj.signPvtKey;
    console.log(JSON.stringify({ encryptionKey, signKey }))
    const startTime = performance.now();
    const cacheObj = decrypt_and_store_keys(encryptionKey, signKey, passphrase);
    // console.log(result2);
    const pubKeyObj = await browser.storage.local.get('signPublicKey');
    console.log("Time taken to decrypt and store keys:", performance.now() - startTime);
    const challengeResponse = await createChallenge(pubKeyObj.signPublicKey);
    await cacheObj;
    const signedMessage = await sign_message_with_stored_key(challengeResponse.data.challenge);
    const verificationResponse = await initiateAuth(signedMessage, pubKeyObj.signPublicKey);
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
    await browser.storage.local.set({ encryptionPvtKey: keyPair.get('enc_private_key'), signPvtKey: keyPair.get('sign_private_key'), encPublicKey: keyPair.get('enc_public_key'), signPublicKey: keyPair.get('sign_public_key') });
    const signature = await sign_message(keyPair.get('sign_private_key'), passphrase, challenge)
    await finalRegistration(username, signature, keyPair.get('sign_public_key'), keyPair.get('enc_public_key'))
    return { isSaved: true }
}

export const decryptCredentialFieldsHandlerNew = async (credentials: Credential[]) => {
    try {

        const response = await decrypt_credentials(credentials);
        return { data: response };
    } catch (error) {
        console.error("Error decrypting credentials:", error);
    }
}

export const addCredentialHandler = async (payload) => {
    try {

        return await encrypt_new_credential(payload.users, payload.addCredentialFields)

    } catch (error) {

        console.error("Error adding credential:", error);
    }

}


export const decryptFieldHandler = async (text: string) => {
    const decrypted = await decrypt_text(text);
    return decrypted;
}


export const encryptFieldHandler = async (fields: any, publicKey: string) => {
    try {

        const response = await encrypt_fields(fields, publicKey);
        return { data: response };
    } catch (error) {
        console.error("Error encrypting fields:", error);
    }
}


export const loadWasmModule = async () => {
    try {
        await init();
    } catch (error) {
        console.error("Error loading WASM module or processing encryption/decryption:", error);
    }
};



export const encryptCredentialsForUser = async (credentials: CredentialFields[], publicKeyStr: string): Promise<CredentialFields[]> => {
    const encryptedCredsForUser: CredentialFields[] = []
    for (const credential of credentials) {
        const encryptedCred: CredentialFields = {
            credentialId: credential.credentialId,
            fields: []
        }
        encryptedCred.credentialId = credential.credentialId
        const response = await encryptFieldHandler(credential.fields, publicKeyStr);
        encryptedCred.fields = response.data
        encryptedCredsForUser.push(encryptedCred)
    }
    return encryptedCredsForUser;
}


export const createShareCredsPayload = async (creds: CredentialFields[], selectedUsers: UserListForEncryption[]): Promise<CredentialsForUsersPayload[]> => {

    const response = await decryptCredentialFieldsHandler(creds)
    const userData: CredentialsForUsersPayload[] = [];
    for (const user of selectedUsers) {
        const userEncryptedFields = await encryptCredentialsForUser(
            response.data,
            user.publicKey,
        );
        if (user.accessType) {
            userData.push({
                userId: user.id,
                credentials: userEncryptedFields,
                accessType: user.accessType,
            });
        } else {
            userData.push({
                userId: user.id,
                credentials: userEncryptedFields,
            });
        }
    }
    return userData;
}

export const handlePvtKeyImport = async (pvtKeys: string, passphrase: string) => {
    await init();
    const { encryptionKey, signKey } = JSON.parse(pvtKeys);
    const signPubKey = await get_pub_key(signKey);
    const encPublicKey = await get_pub_key(encryptionKey);

    const challegeResult = await createChallenge(signPubKey)
    await decrypt_and_store_keys(encryptionKey, signKey, passphrase)
    const signedMessage = await sign_message_with_stored_key(challegeResult.data.challenge)
    const verificationResponse = await initiateAuth(signedMessage, signPubKey);
    const token = verificationResponse.data.token;
    if (token) {
        await browser.storage.local.set({ token: token });
        await browser.storage.local.set({ isLoggedIn: true });
    }
    await browser.storage.local.set({ encryptionPvtKey: encryptionKey, signPvtKey: signKey, encPublicKey: encPublicKey, signPublicKey: signPubKey });

    return token;

}