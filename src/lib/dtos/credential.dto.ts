// new cred definitons

type UUID = string;
type FieldType = "meta" | "sensitive" | "additional" | "totp";
export type Fields = {
	fieldId?: string;
	fieldName?: string;
	fieldValue: string;
	fieldType?: FieldType;
};

export type UserEncryptedFields = {
	userId: string;
	fields: Fields[];
};

export type CredentialBasic = {
	credentialId: string;
	fields: Fields[];
};

export type Credential = CredentialBasic & {
	name: string;
	accessType: string;
	description: string;
	folderId: UUID;
	domain: string;
	credentialType: string;
	createdAt: string;
	createdBy: string;
	updatedAt: string;
};

export type SearchedCredential = {
	description: string;
	domain: string;
	folderId: UUID;
	folderName: string;
	credentialId: UUID;
	name: string;
};

export type CredentialFields = {
	credentialId: string;
	fields: BasicFields[];
};

export type BasicFields = {
	fieldId: string;
	fieldValue: string;
};

export type UserEncryptedCredentials = {
	userId: string;
	credentials: CredentialFields[];
};

export type AddCredentialField = {
	fieldName: string;
	fieldValue: string;
	sensitive: boolean;
};

export type CredentialFieldWithId = AddCredentialField & {
	id: string;
};

export type InjectionPayload = {
	id: string | undefined;
	username: string;
};
