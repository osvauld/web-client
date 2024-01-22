
import browser from 'webextension-polyfill';
import { CredentialsForUsersPayload, EncryptedCredentialFields, UserWithAccessType } from './dtos';
import { encryptCredentialsForUser } from "../../utils/helperMethods";

export const createShareCredsPayload = async (creds: EncryptedCredentialFields[], selectedUsers: UserWithAccessType[]): Promise<CredentialsForUsersPayload[]> => {

    const response = await browser.runtime.sendMessage({
        action: "decrypt",
        data: creds,
    });

    const userData: CredentialsForUsersPayload[] = [];
    for (const user of selectedUsers) {
        const userEncryptedFields = await encryptCredentialsForUser(
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

