import { writable } from "svelte/store";
import browser from "webextension-polyfill";
import { Group, SelectedGroup } from "../dtos/group.dto";
import { User } from "../dtos/user.dto";

export let groupStore = writable<SelectedGroup[]>([]);
export let groupList = writable<SelectedGroup[]>([]);
export let groupUsers = writable<User[]>([]);
export let selectedGroup = writable<SelectedGroup | null>(null);
const storedGroup = browser.storage.local.get("selectedGroup");
storedGroup.then((value) => {
	if (value.selectedGroup) {
		selectedGroup.set(value.selectedGroup);
	} else {
		selectedGroup.set(null);
	}
});
selectedGroup.subscribe((value) => {
	browser.storage.local.set({ selectedGroup: value });
});
