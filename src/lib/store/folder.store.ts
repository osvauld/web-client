import { writable } from "svelte/store";
import browser from 'webextension-polyfill'
import { Folder } from "../dtos/folder.dto";
export let folderStore = writable<Folder[]>([]);

export let selectedFolder = writable<Folder | null>(null);

const storedFolder = browser.storage.local.get("selectedFolder");
storedFolder.then((value) => {
    if (value.selectedFolder) {
        selectedFolder.set(value.selectedFolder);
    } else {
        selectedFolder.set(null);
    }
});
selectedFolder.subscribe((value) => {
    browser.storage.local.set({ selectedFolder: value });
})