import { writable } from "svelte/store";

export let currentVault = writable("all");
export let vaultSwitchActive = writable(false);
export let selectedCredentialType = writable("");
export let categorySelection = writable(false);
export let vaults = writable([{ id: "all", name: "All Vaults" }]);
