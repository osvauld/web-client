import { Group } from "./group.dto";
import { UserWithAccessType, User } from "./user.dto";
import { Folder } from "./folder.dto";
import {
	Credential,
	CredentialFields,
	SearchedCredential,
} from "./credential.dto";
import {
	CliUsersData,
	EnvironmentFields,
	Environments,
} from "./environments.dto";

export type BaseResponse = {
	success: boolean;
	message: string;
	data: any;
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
	data: UserWithAccessType[];
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
	data: {
		credentialId: string;
		fieldName: string;
		fieldValue: string;
	}[];
};

export type FetchAllUserGroupsResponse = BaseResponse & {
	data: Group[];
};

export type FetchGroupUsersResponse = BaseResponse & {
	data: UserWithAccessType[];
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
	data: UserWithAccessType[];
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
type UserType = {
	id: string;
	name: string;
	username: string;
	type: string;
};

export type GetUserResponse = BaseResponse & {
	data: UserType;
};

export type GetAllUsersResponse = BaseResponse & {
	data: UserType[];
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

export type UsersForDataSync = {
	id: string;
	publicKey: string;
};

export type FetchFolderUsersForDataSyncResponse = BaseResponse & {
	data: UsersForDataSync[];
};

export type FetchCredentialUsersForDataSyncResponse = BaseResponse & {
	data: UserWithAccessType[];
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
