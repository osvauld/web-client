import { writable } from "svelte/store";

export let currentView = writable("all");
export let vaults = writable([]);
export let currentVault = writable({ id: "all", name: "all vaults" });
export let credentialListWithType = writable("");
