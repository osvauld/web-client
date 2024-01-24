import { writable } from "svelte/store";
import { Credential, CredentialBase } from "../dtos/credential.dto";

export const credentialStore = writable<Credential[]>([]);
export const selectedCredential = writable<CredentialBase | null>(null);
