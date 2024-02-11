
import browser from 'webextension-polyfill';
import { CredentialFields } from './dtos';
import { encryptCredentialsForUserNew } from "../../utils/helperMethods";

type CredentialsForUsersPayload = {
    accessType?: string;
    userId: string;
    credentials: CredentialFields[];
}
type UserListForEncryption = { id: string, publicKey: string, accessType?: string };
export const createShareCredsPayload = async (creds: CredentialFields[], selectedUsers: UserListForEncryption[]): Promise<CredentialsForUsersPayload[]> => {


    const response = await browser.runtime.sendMessage({
        action: "decrypt",
        data: creds,
    });

    const userData: CredentialsForUsersPayload[] = [];
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

type TypeToClassKey = "read" | "write" | "owner";
export const setbackground = (type: TypeToClassKey): string => {

    const typeToClassMap: Record<TypeToClassKey, string> = {
        read: "bg-osvauld-readerOrange text-osvauld-readerText",
        write: "bg-osvauld-managerPurple text-osvauld-managerText",
        owner: "bg-osvauld-ownerGreen text-osvauld-ownerText"
    };

    return typeToClassMap[type] || "";
}
