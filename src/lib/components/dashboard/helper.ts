
import browser from 'webextension-polyfill';
import { CredentialFields, CredentialsForUsersPayload, UserWithAccessType } from './dtos';
import { encryptCredentialsForUserNew } from "../../utils/helperMethods";

export const createShareCredsPayload = async (creds: CredentialFields[], selectedUsers: UserWithAccessType[]): Promise<CredentialsForUsersPayload[]> => {


    const response = await browser.runtime.sendMessage({
        action: "decrypt",
        data: creds,
    });

    const userData: any = [];
    for (const user of selectedUsers) {
        const userEncryptedFields = await encryptCredentialsForUserNew(
            response.data,
            user.publicKey,
        );
        if (user.accessType) {
            userData.push({
                userId: user.id,
                credentials: userEncryptedFields,
                accessType: user.accessType,
            });
        } else {
            userData.push({
                userId: user.id,
                credentials: userEncryptedFields,
            });
        }
    }
    return userData;
}

export const setbackground = (type: string): string => {
    const typeToClassMap = {
        read: "bg-osvauld-readerOrange text-osvauld-readerText",
        write: "bg-osvauld-managerPurple text-osvauld-managerText",
        owner: "bg-osvauld-ownerGreen text-osvauld-ownerText"
    };

    return typeToClassMap[type] || "";
}
