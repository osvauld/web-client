import { writable } from "svelte/store";
import { Credential } from "../dtos/credential.dto";

export const credentialStore = writable<Credential[]>([]);
export const selectedCredential = writable<Credential | null>(null);
