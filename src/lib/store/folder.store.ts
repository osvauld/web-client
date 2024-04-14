import { writable } from "svelte/store";
import browser from 'webextension-polyfill'
import { Folder } from "../dtos/folder.dto";
export let folderStore = writable<Folder[]>([]);

export let selectedFolder = writable<Folder | null>(null);

selectedFolder.subscribe((value) => {
    browser.storage.local.set({ selectedFolder: value });
})