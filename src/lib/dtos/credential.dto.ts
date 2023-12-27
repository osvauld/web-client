export type sampleCredential = {
  username: string;
  password: string;
}


export type CredentialBase = {
  id: string;
  description: string;
  name: string;
  unencryptedFields: CredentialFields[];
};

export type CredentialDetails = CredentialBase & {
  encryptedFields: CredentialFields[];
};
export type CredentialFields = {
  fieldName: string;
  fieldValue: string;
};

export type AddCredentialFieldPayload = CredentialFields & {
  sensitive: boolean;
};

export type AddCredentialPayload = {
  name: string;
  description: string;
  folderId: string;
  unencryptedFields: CredentialFields[];
  userAccessDetails: UserAccessPayload[];
};

export type UserAccessPayload = {
  userId: string;
  encryptedFields: CredentialFields[];
};

export type ShareCredentialPayload = {
  credentialId: string;
  users: UserPayaloadForShare[];
};

type UserPayaloadForShare = {
  userId: string;
  fields: CredentialFields[];
  accessType: string;
};
