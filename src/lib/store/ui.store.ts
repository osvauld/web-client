import { writable } from "svelte/store";

export let selectedPage = writable("Credentials");
export const isLoggedIn = writable(false);
