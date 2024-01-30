import { UserEncryptedCredentials, UserEncryptedFields } from "./credential.dto";


export type AddCredentialPayload = {
    name: string;
    description: string;
    folderId: string;
    credentialType: string;
    userFields: UserEncryptedFields[];
}
export type UserEncryptedDataForShareCredentials = UserEncryptedCredentials & {
    accessType: string;
}

export type ShareCredentialsWithUsersPayload = {
    userData: UserEncryptedDataForShareCredentials[];
}

export type GroupEncryptedDataForShareCredentials = {
    groupId: string;
    accessType: string;
    userData: UserEncryptedCredentials[];
}

export type ShareCredentialsWithGroupsPayload = {
    groupData: GroupEncryptedDataForShareCredentials[];
}

export type ShareFolderWithUsersPayload = {
    folderId: string;
    userData: UserEncryptedDataForShareCredentials[];
}

export type ShareFolderWithGroupsPayload = {
    folderId: string;
    groupData: GroupEncryptedDataForShareCredentials[];
}

export type CreateGroupPayload = {
    name: string;
}
