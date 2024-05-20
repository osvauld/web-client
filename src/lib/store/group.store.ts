import { writable } from "svelte/store";
import browser from "webextension-polyfill";
import { Group } from "../dtos/group.dto";
import { UserWithAccessType } from "../dtos/user.dto";

export let groupStore = writable<Group[]>([]);
export let groupList = writable<Group[]>([]);
export let groupUsers = writable<UserWithAccessType[]>([]);
export let selectedGroup = writable<Group | null>(null);

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
