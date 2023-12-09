import { writable } from "svelte/store";
import { Secret } from "../dtos/secret.dto";

export const secretsStore = writable<Secret[]>([]);
export const selectedSecret = writable<Secret | null>(null);
