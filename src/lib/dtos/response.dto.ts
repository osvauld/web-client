import { Group } from "./group.dto";
import { User } from "./user.dto";
import { Folder } from "./folder.dto";
import {
	Credential,
	CredentialFields,
	SearchedCredential,
	Field,
	UsersForDataSync,
} from "./credential.dto";
import {
	CliUsersData,
	EnvironmentFields,
	Environments,
} from "./environments.dto";

export type BaseResponse = {
	success: boolean;
	message: string;
};

export type ChallengeResponse = BaseResponse & {
	data: {
		challenge: string;
	};
};

export type AuthResponse = BaseResponse & {
	data: {
		token: string;
	};
};

export type FolderGroupResponse = BaseResponse & {
	data: Group[];
};

export type FolderUserResponse = BaseResponse & {
	data: User[];
};

export type FetchAllUsersResponse = BaseResponse & {
	data: User[];
};

export type FetchAllFoldersResponse = BaseResponse & {
	data: Folder[];
};

export type FetchCredentialsByFolderResponse = BaseResponse & {
	data: Credential[];
};

export type FetchCredentialsFieldsByFolderIdResponse = BaseResponse & {
	data: CredentialFields[];
};

export type FetchCredentialsFieldsByIdsResponse = BaseResponse & {
	data: CredentialFields[];
};

export type FetchCredsByIdsResponse = BaseResponse & {
	data: Credential[];
};

type UrlCredMap = {
	value: string;
	credentialId: string;
};
export type FetchAllUserUrlsResponse = BaseResponse & {
	data: UrlCredMap[];
};

export type FetchSensitiveFieldsByCredenitalIdResponse = BaseResponse & {
	data: Field[];
};

export type FetchAllUserGroupsResponse = BaseResponse & {
	data: Group[];
};

export type FetchGroupUsersResponse = BaseResponse & {
	data: User[];
};

export type fetchUsersByGroupIdsResponse = BaseResponse & {
	data: {
		groupId: string;
		userDetails: {
			id: string;
			publicKey: string;
		}[];
	}[];
};

export type FetchGroupsWithoutAccessResponse = BaseResponse & {
	data: Group[];
};

export type FetchGroupCredentialResponse = BaseResponse & {
	data: CredentialFields[];
};

export type FetchCredentialUsersResponse = BaseResponse & {
	data: User[];
};

export type FetchCredentialGroupsResponse = BaseResponse & {
	data: Group[];
};
export type FetchUsersWithoutGroupAccess = BaseResponse & {
	data: User[];
};

export type SearchResponse = BaseResponse & {
	data: SearchedCredential[];
};

export type UserNameAvailabilityResponse = BaseResponse & {
	data: {
		available: boolean;
		message: string;
	};
};

export type GetUserResponse = BaseResponse & {
	data: User;
};

export type GetAllUsersResponse = BaseResponse & {
	data: User[];
};

export type AddCliUserResponse = BaseResponse & {
	data: {
		user: string;
	};
};

export type GetCliUsersResponse = BaseResponse & {
	data: {
		id: string;
		username: string;
	}[];
};

export type FetchFolderUsersForDataSyncResponse = BaseResponse & {
	data: UsersForDataSync[];
};

export type FetchCredentialUsersForDataSyncResponse = BaseResponse & {
	data: UsersForDataSync[];
};

export type GetEnvironmentsResponse = BaseResponse & {
	data: Environments[];
};

export type FetchEnvFieldsResponse = BaseResponse & {
	data: EnvironmentFields[];
};

export type GetEnvFieldsByCredentialIdResponse = BaseResponse & {
	data: CliUsersData[];
};

export type GetEnvsForCredentialResponse = BaseResponse & {
	data: {
		envId: string;
		cliUserPublickey: string;
		cliUserId: string;
		cliUserCreatedBy: string;
	}[];
};

export type CreateGroupResponse = BaseResponse & {
	data: {
		groupId: string;
	};
};

export type CreateFolderResponse = BaseResponse & {
	data: {
		folderId: string;
		name: string;
		description: string;
		createdBy: string;
		createdAt: string;
	};
};
