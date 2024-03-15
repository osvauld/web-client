import { getTokenAndBaseUrl } from "../components/dashboard/helper";
import { ChallengeResponse, AuthResponse } from "../dtos/response.dto";

export const initiateAuth = async (signedText: string, publicKey: string): Promise<AuthResponse> => {
    const { baseUrl } = await getTokenAndBaseUrl()
    return await fetch(`${baseUrl}/user/verify`, {
        method: "POST",
        body: JSON.stringify({ signature: signedText, publicKey: publicKey })
    }).then(res => res.json())
};


export const createChallenge = async (publicKey: string) => {

    const { baseUrl } = await getTokenAndBaseUrl()
    return await fetch(`${baseUrl}/user/challenge`, {
        method: "POST",
        body: JSON.stringify({ publicKey: publicKey })
    }).then(res => res.json())
};

export const getRegsitrationChallenge = async (username: string, tempPassword: string): Promise<ChallengeResponse> => {

    const { baseUrl } = await getTokenAndBaseUrl()
    return await fetch(`${baseUrl}/user/temp-login`, {
        method: "POST",
        body: JSON.stringify({ username, tempPassword })
    }).then(res => res.json())
}

export const finalRegistration = async (username: string, signature: string, deviceKey: string, encryptionKey: string) => {
    const { baseUrl } = await getTokenAndBaseUrl()
    return await fetch(`${baseUrl}/user/register`, {
        method: "POST",
        body: JSON.stringify({ username, signature, deviceKey, encryptionKey })
    }).then(res => res.json())
}
