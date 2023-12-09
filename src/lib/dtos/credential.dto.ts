export type Credential = {
  id: string;
  description: string;
  name: string;
  unencryptedData: credentialFields[];
  encryptedData?: credentialFields[];
};

type credentialFields = {
  fieldName: string;
  fieldValue: string;
};
