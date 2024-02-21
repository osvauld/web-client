import { baseUrl } from "./temp";
import { ChallengeResponse, AuthResponse } from "../dtos/response.dto";

export const initiateAuth = async (signedText: string, publicKey: string): Promise<AuthResponse> => {

    return await fetch(`${baseUrl}/user/verify`, {
        method: "POST",
        body: JSON.stringify({ signature: signedText, publicKey: publicKey })
    }).then(res => res.json())
};


export const createChallenge = async (publicKey: string) => {
    return await fetch(`${baseUrl}/user/challenge`, {
        method: "POST",
        body: JSON.stringify({ publicKey: publicKey })
    }).then(res => res.json())
};

export const getChallenge = async (username: string, tempPassword: string): Promise<ChallengeResponse> => {
    return await fetch(`${baseUrl}/temp/login`, {
        method: "POST",
        body: JSON.stringify({ username, tempPassword})
    }).then(res => res.json())
}

export const finalRegistration = async (username: string, signature: string, deviceKey: string,encryptionKey: string) => {
    return await fetch(`${baseUrl}/user/register`, {
        method: "POST",
        body: JSON.stringify({ username, signature, deviceKey, encryptionKey})
    }).then(res => res.json())
}
