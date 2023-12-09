import { writable } from "svelte/store";
import { Folder } from "../dtos/folder.dto";
export let folderStore = writable<Folder[]>([]);

export let selectedFolder = writable<Folder | null>(null);
