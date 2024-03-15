import { createChallenge, initiateAuth, verifyNewUser } from "../apis/auth.api"
import { signTextWithPrivateKey, derivePublicKeyFromECCPrivateKey, importRSAPublicKey, encryptWithPublicKey } from "./crypto"
import { CredentialFields, Fields } from "../dtos/credential.dto"
import browser from 'webextension-polyfill';


export const intiateAuth = async (privateKey: CryptoKey): Promise<string> => {
    const publicKey = await derivePublicKeyFromECCPrivateKey(privateKey)
    const responseJson = await createChallenge(publicKey);
    const signedText = await signTextWithPrivateKey(privateKey, responseJson.data.challenge) || ""
    const response = await initiateAuth(signedText, publicKey)
    return response.data.token
}




export const encryptCredentialsForUserNew = async (credentials: CredentialFields[], publicKeyStr: string): Promise<CredentialFields[]> => {
    const encryptedCredsForUser: CredentialFields[] = []
    for (const credential of credentials) {
        const encryptedCred: CredentialFields = {
            credentialId: credential.credentialId,
            fields: []
        }
        encryptedCred.credentialId = credential.credentialId
        const response = await browser.runtime.sendMessage({
            action: "encryptFields",
            data: { fields: credential.fields, publicKey: publicKeyStr },
        });
        encryptedCred.fields = response.data
        encryptedCredsForUser.push(encryptedCred)
    }
    return encryptedCredsForUser;
}

export const encryptCredentialFields = async (fields: Fields[], publicKey: string): Promise<Fields[]> => {
    const publicKeyObj = await importRSAPublicKey(publicKey)
    const encryptedFields: Fields[] = []
    for (const field of fields) {
        const encryptedValue = await encryptWithPublicKey(field.fieldValue, publicKeyObj)
        encryptedFields.push({ ...field, fieldValue: encryptedValue })
    }
    return encryptedFields
}


