import { writable } from "svelte/store";
import { Folder } from "../dtos/folder.dto";
import { Environments } from "../dtos/environments.dto";
import { LocalStorageService } from "../../scripts/storageHelper";
export let folderStore = writable<Folder[]>([]);

export let envStore = writable<Environments[]>([]);
export let selectedEnv = writable<Environments | null>(null);

export let selectedFolder = writable<Folder | undefined>(undefined);

selectedFolder.subscribe((value) => {
	if (value) {
		LocalStorageService.set("selectedFolder", value, true);
	}
});
