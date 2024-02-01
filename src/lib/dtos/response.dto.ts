import { Group, GroupWithAccessType } from './group.dto'
import { UserWithAccessType, User } from './user.dto';
import { Folder } from './folder.dto';
import { Credential, CredentialFields } from './credential.dto';

export type BaseResponse = {
    success: boolean;
    message: string;
}

export type ChallengeResponse = BaseResponse & {
    data: {
        challenge: string;
    }
}

export type AuthResponse = BaseResponse & {
    data: {
        token: string;
    }
}

export type FolderGroupResponse = BaseResponse & {
    data: GroupWithAccessType[];
}

export type FolderUserResponse = BaseResponse & {
    data: UserWithAccessType[];
}
// TODO: change fetchallfolders api 
export type FetchFoldersResponse = BaseResponse & {
    data: Folder[];
}


export type FetchAllUsersResponse = BaseResponse & {
    data: User[]
}

export type FetchAllFoldersResponse = BaseResponse & {
    data: Folder[]
}


export type FetchCredentialsByFolderResponse = BaseResponse & {
    data: Credential[];
}

export type FetchCredentialsFieldsByFolderIdResponse = BaseResponse & {
    data: CredentialFields[];
}

export type FetchCredentialsFieldsByIdsResponse = BaseResponse & {
    data: CredentialFields[];
}

export type FetchCredsByIdsResponse = BaseResponse & {
    data: Credential[];
}

type UrlCredMap = {
    value: string;
    credentialId: string;
}
export type FetchAllUserUrlsResponse = BaseResponse & {
    data: UrlCredMap[];
}

export type FetchSensitiveFieldsByCredenitalIdResponse = BaseResponse & {
    data: {
        credentialId: string;
        fieldName: string;
        fieldValue: string;
    }[]
}

export type FetchAllUserGroupsResponse = BaseResponse & {
    data: Group[]
}

export type FetchGroupUsersResponse = BaseResponse & {
    data: User[];
}

export type fetchUsersByGroupIdsResponse = BaseResponse & {
    data: {
        groupId: string;
        userDetails: {
            id: string;
            publicKey: string;
        }[]
    }[]
}

export type FetchGroupsWithoutAccessResponse = BaseResponse & {
    data: Group[];
}

export type FetchGroupCredentialResponse = BaseResponse & {
    data: CredentialFields[];
}

export type FetchCredentialUsersResponse = BaseResponse & {
    data: UserWithAccessType[]
}

export type FetchCredentialGroupsResponse = BaseResponse & {
    data: GroupWithAccessType[]
}