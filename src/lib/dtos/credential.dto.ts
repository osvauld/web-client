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

// export type CredentialFields = {
//   fieldName: string;
//   fieldValue: string;
// };

export type AddCredentialFieldPayload = CredentialFields & {
  sensitive: boolean;
};

// export type AddCredentialPayload = {
//   name: string;
//   description: string;
//   folderId: string;
//   unencryptedFields: CredentialFields[];
//   userEncryptedFields: UserEncryptedPayload[];
// };

// type UserEncryptedPayload = {
//   userId: string;
//   encryptedFields: CredentialFields[];
// };



export type ShareCredentialsWithUsersPayload = {
  userData: CredentialsForUsersPayload[]
}

export type CredentialsForUsersPayload = {
  userId: string;
  accessType?: string;
  credentials: EncryptedCredentialFields[];
}


export type EncryptedCredentialFields = {
  credentialId?: string;
  encryptedFields: CredentialFields[];
}


export type DecryptedPaylod = {
  credentialId?: string,
  decryptedFields: CredentialFields[]
}

// ---------------------------------------------------------------------------------------------------------------
// new cred definitons

type UUID = string;
type FieldType = 'meta' | 'sensitive' | 'additional';
export type Fields = {

  fieldId?: string;
  fieldName?: string;
  fieldValue: string;
  fieldType?: FieldType;
}


export type AddCredentialPayload = {
  name: string;
  description: string;
  folderId: string;
  credentialType: string;
  userFields: UserEncryptedFields[];
}

export type UserEncryptedFields = {
  userId: string;
  fields: Fields[];
}

export type CredentialBasic = {
  credentialId?: string,
  fields: Fields[]
}

export type Credential = CredentialBasic & {
  name: string;
  description: string;
  folderId: UUID;
  credentialType: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export type CredentialFields = {
  credentialId: string;
  fields: BasicFields[];
}

export type BasicFields = {
  fieldId: string;
  fieldValue: string;

}