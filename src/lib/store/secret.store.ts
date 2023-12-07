import { writable } from "svelte/store";

type Secret = {
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

export const secretsStore = writable<Secret[]>([]);
export const selectedSecret = writable<Secret | null>(null);
