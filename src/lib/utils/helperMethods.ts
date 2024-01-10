import { createChallenge, initiateAuth, verifyNewUser } from "../apis/auth.api"
import { signTextWithPrivateKey, derivePublicKeyFromECCPrivateKey, importRSAPublicKey, encryptWithPublicKey } from "./crypto"
import { DecryptedPaylod, EncryptedCredentialFields } from "../dtos/credential.dto"

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

export const encryptCredentialsForUser = async (credentials: DecryptedPaylod[], publicKeyStr: string): Promise<EncryptedCredentialFields[]> => {
    const publicKey = await importRSAPublicKey(publicKeyStr)
    const encryptedCredsForUser: EncryptedCredentialFields[] = []
    for (const credential of credentials) {
        const encryptedCred: EncryptedCredentialFields = {
            credentialId: credential.credentialId,
            encryptedFields: []
        }
        for (const field of credential.decryptedFields) {
            const encryptedValue = await encryptWithPublicKey(field.fieldValue, publicKey)
            encryptedCred.encryptedFields.push({ fieldName: field.fieldName, fieldValue: encryptedValue })
        }
        encryptedCredsForUser.push(encryptedCred)
    }
    return encryptedCredsForUser;
}
