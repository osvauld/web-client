import { createChallenge, initiateAuth, verifyNewUser } from "../apis/auth.api"
import { signTextWithPrivateKey, verifySignatureWithPublicKey, derivePublicKeyFromECCPrivateKey } from "./crypto"

export const intiateAuth = async (privateKey: CryptoKey): Promise<string> => {
    console.log('privateKey', privateKey)
    const publicKey = await derivePublicKeyFromECCPrivateKey(privateKey)
    console.log('publicKey', publicKey)
    const responseJson = await createChallenge(publicKey);
    const signedText = await signTextWithPrivateKey(privateKey, responseJson.data.challenge) || ""
    const verified = await verifySignatureWithPublicKey(publicKey, responseJson.data.challenge, signedText)
    console.log('verified', verified)
    const response = await initiateAuth(signedText, publicKey)

    console.log("TRIGGERED", response.data)
    return response.data.token
}

export const verifyUser = async (username: string, password: string, rsaKey: string, eccKey: string): Promise<boolean> => {
    const response = await verifyNewUser(username, password, rsaKey, eccKey)
    console.log("API Response===>", response)
    return response.success
}
