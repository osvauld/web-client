import { writable } from "svelte/store";
import { Credential, SearchResponse } from "../dtos/credential.dto";

export const credentialStore = writable<Credential[]>([]);
export const selectedCredential = writable<Credential | null>(null);
export const searchedCredential = writable<SearchResponse | null>(null);

