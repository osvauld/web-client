
import browser from "webextension-polyfill";

import { decryptCredentialFields, deriveKeyFromPassphrase, encryptPvtKeyWithSymmerticKey, generateRandomString, decryptPvtKeys } from "../lib/utils/crypto";
import { intiateAuth, } from "../lib/utils/helperMethods";
import { EncryptedCredentialFields, DecryptedPaylod, Credential } from "../lib/dtos/credential.dto";


export const decryptCredentialFieldsHandler = async (credentials: EncryptedCredentialFields[], rsaPvtKey: CryptoKey) => {

    // const returnPayload: DecryptedPaylod[] = [];
    // for (const credential of credentials) {
    //     const decryptedFields = await decryptCredentialFields(credential.encryptedFields, rsaPvtKey);
    //     const payload: DecryptedPaylod = {
    //         credentialId: credential.credentialId,
    //         decryptedFields
    //     }
    //     returnPayload.push(payload)
    // }
    // return { data: returnPayload };
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