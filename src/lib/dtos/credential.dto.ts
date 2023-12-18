export type Credential = {
  id: string;
  description: string;
  name: string;
  unencryptedData: CredentialFields[];
  encryptedData?: CredentialFields[];
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
  encryptedFields: encryptedFieldPayload[];
};

export type encryptedFieldPayload = {
  userId: string;
  fields: CredentialFields[];
};
