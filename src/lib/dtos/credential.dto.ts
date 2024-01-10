export type sampleCredential = {
  username: string;
  password: string;
}


export type CredentialBase = {
  id: string;
  description: string;
  name: string;
  unencryptedFields: CredentialFields[];
  encryptedFields?: CredentialFields[];
};

export type CredentialDetails = CredentialBase & {
  encryptedFields?: CredentialFields[];
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



export type ShareCredentialsWithUsersPayload = {
  userData: MultipleCredentialForUsersPayload[]
}

type MultipleCredentialForUsersPayload = {
  userId: string;
  accessType: string;
  credentials: UserCredentialPayload[];
}

type UserCredentialPayload = {
  credentialId: string;
  encryptedFields: CredentialFields[];
}

export type EncryptedCredentialFields = {
  credentialId: string;
  encryptedFields: CredentialFields[];
}


export type DecryptedPaylod = {
  credentialId: string,
  decryptedFields: CredentialFields[]
}