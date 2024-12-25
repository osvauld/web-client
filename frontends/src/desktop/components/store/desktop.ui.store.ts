import { writable } from "svelte/store";

export let currentView = writable("all");
export let vaults = writable([]);
export let currentVault = writable({ id: "all", name: "all vaults" });
export let selectedCategory = writable("");
export let addCredentialModal = writable(false);
export let credentialEditorModal = writable(false);
export let selectedCategoryForInput = writable("");
export let selectedVaultForInput = writable("");
export let viewCredentialModal = writable(false);
export let currentCredential = writable({});
