import { writable } from "svelte/store";
import browser from "webextension-polyfill";
import { Group } from "../dtos/group.dto";
import { User } from "../dtos/user.dto";

export let groupStore = writable<Group[]>([]);
export let groupList = writable<Group[]>([]);
export let groupUsers = writable<User[]>([]);
export let selectedGroup = writable<SelectedGroup | null>(null);
type GroupAccess = "admin" | "member";
type SelectedGroup = {
	groupId: string;
	name: string;
	accessType: GroupAccess;
};
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
