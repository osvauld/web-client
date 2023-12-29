import { baseUrl } from "./temp";

export const initiateAuth = async (signedText: string, publicKey: string) => {

    return await fetch(`${baseUrl}/user/verify`, {
        method: "POST",
        body: JSON.stringify({ signature: signedText, publicKey: publicKey })
    }).then(res => res.json())
};


export const createChallenge = async ( publicKey: string) => {
    return await fetch(`${baseUrl}/user/challenge`, {
        method: "POST",
        body: JSON.stringify({ publicKey: publicKey })
    } ).then(res => res.json())
};
