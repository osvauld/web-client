import { writable } from "svelte/store";

export let selectedPage = writable("Secrets");
export const isLoggedIn = writable(false);