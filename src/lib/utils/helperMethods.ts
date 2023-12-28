import { createChallenge, initiateAuth } from "../apis/auth.api"
import { signTextWithPrivateKey } from "./crypto"

export const intiateAuth = async (privateKey: CryptoKey, publicKey: string): Promise<string> => {
    const challengeParams = await createChallenge("USER_ID", publicKey);
    const signedText = await signTextWithPrivateKey(privateKey, challengeParams.challenge_data) || ""
    const response = await initiateAuth(signedText, publicKey)
    return response.token
}