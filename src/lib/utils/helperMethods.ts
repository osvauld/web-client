import { createChallenge, initiateAuth, verifyNewUser } from "../apis/auth.api"
import { signTextWithPrivateKey, derivePublicKeyFromECCPrivateKey, importRSAPublicKey, encryptWithPublicKey } from "./crypto"
import { CredentialBasic } from "../dtos/credential.dto"

export const intiateAuth = async (privateKey: CryptoKey): Promise<string> => {
    const publicKey = await derivePublicKeyFromECCPrivateKey(privateKey)
    const responseJson = await createChallenge(publicKey);
    const signedText = await signTextWithPrivateKey(privateKey, responseJson.data.challenge) || ""
    const response = await initiateAuth(signedText, publicKey)
    return response.data.token
}

export const verifyUser = async (username: string, password: string, rsaKey: string, eccKey: string): Promise<boolean> => {
    const response = await verifyNewUser(username, password, rsaKey, eccKey)
    return response.success
}




export const encryptCredentialsForUserNew = async (credentials: CredentialBasic[], publicKeyStr: string): Promise<CredentialBasic[]> => {
    const publicKey = await importRSAPublicKey(publicKeyStr)
    const encryptedCredsForUser: CredentialBasic[] = []
    for (const credential of credentials) {
        const encryptedCred: CredentialBasic = {
            fields: []
        }
        if (credential.credentialId) {
            encryptedCred.credentialId = credential.credentialId
        }
        for (const field of credential.fields) {
            const encryptedValue = await encryptWithPublicKey(field.fieldValue, publicKey)
            encryptedCred.fields.push({ ...field, fieldValue: encryptedValue })
        }
        encryptedCredsForUser.push(encryptedCred)
    }
    return encryptedCredsForUser;
}