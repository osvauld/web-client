export type Secret = {
  id: string;
  description: string;
  name: string;
  unencryptedData: SecretFields[];
  encryptedData?: SecretFields[];
};

type SecretFields = {
  fieldName: string;
  fieldValue: string;
};
