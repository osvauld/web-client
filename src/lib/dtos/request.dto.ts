import { UserEncryptedCredentials, UserEncryptedFields, CredentialFields } from "./credential.dto";



type CommonFields = {
    name: string;
    description: string;
    credentialType: string;
};

type EditFieldsPayload = {
    editFields: UserEncryptedFields[];
};

type UserFieldsPayload = { // or add fields payload
    folderId: string;
    userFields: UserEncryptedFields[];
};

export type EditCredentialPayload = CommonFields & (EditFieldsPayload | UserFieldsPayload);



export type AddCredentialPayload = {
    name: string;
    description: string;
    folderId: string;
    credentialType: string;
    userFields: UserEncryptedFields[];
}

export type editCredentialPayload = {
    name: string;
    description: string;
    credentialType: string;
    editFields: UserEncryptedFields[];
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

export type AddUserToGroupPayload = {

    groupId: string;
    memberId: string;
    memberRole: string;
    credentials: CredentialFields[];
}
