import { createChallenge, initiateAuth } from "../apis/auth.api"
import { signTextWithPrivateKey } from "./crypto"

export const intiateAuth = async (privateKey: CryptoKey, publicKey: string): Promise<string> => {
    const responseJson = await createChallenge( publicKey);
    const signedText = await signTextWithPrivateKey(privateKey, responseJson.data.challenge) || ""
    const response = await initiateAuth(signedText, publicKey)
    console.log("TRIGGERED", response.data)
    return response.data.token
}