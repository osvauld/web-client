
// new cred definitons

type UUID = string;
type FieldType = 'meta' | 'sensitive' | 'additional';
export type Fields = {

  fieldId?: string;
  fieldName?: string;
  fieldValue: string;
  fieldType?: FieldType;
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

export type UserEncryptedCredentials = {
  userId: string;
  credentials: CredentialFields[];
}
