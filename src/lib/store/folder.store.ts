import { writable } from "svelte/store";
import browser from "webextension-polyfill";
import { Folder } from "../dtos/folder.dto";
import { Environments } from "../dtos/environments.dto";
export let folderStore = writable<Folder[]>([]);

export let envStore = writable<Environments[]>([]);
export let selectedEnv = writable<Environments | null>(null);

export let selectedFolder = writable<Folder | undefined>(undefined);

selectedFolder.subscribe((value) => {
	browser.storage.local.set({ selectedFolder: value });
});
