import { baseUrl } from "./temp";

export const initiateAuth = async (signedText: string, publicKey: string) => {

    // const response = await fetch(`${baseUrl}/auth`, {
    //     method: "POST",
    //     body: JSON.stringify({ challenge_response: signedText, public_key: publicKey })
    // });

    // if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    // }

    // return response.json();
    console.log(JSON.stringify({ challenge_response: signedText, public_key: publicKey }))
    return ({ token: "token" })
};


export const createChallenge = async (userId: string, publicKey: string) => {

    // const response = await fetch(`${baseUrl}/create-challenge`, {
    //     method: "POST",
    //     body: JSON.stringify({ user_id: userId, public_key: publicKey })
    // });

    // if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    // }

    // return response.json();
    console.log(JSON.stringify({ user_id: userId, public_key: publicKey }))
    return ({ challenge_name: "token", challenge_data: "4233523423434" })
};
