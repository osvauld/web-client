import { writable } from "svelte/store";
import { CredentialBase } from "../dtos/credential.dto";

export const credentialStore = writable<CredentialBase[]>([]);
export const selectedCredential = writable<CredentialBase | null>(null);
