import { writable } from "svelte/store";
import { SelectedGroup } from "../dtos/group.dto";
import { GroupUser } from "../dtos/user.dto";

export let groupStore = writable<SelectedGroup[]>([]);
export let groupList = writable<SelectedGroup[]>([]);
export let groupUsers = writable<GroupUser[]>([]);
export let selectedGroup = writable<SelectedGroup | null>(null);
const storedGroup = localStorage.getItem("selectedGroup");
if (storedGroup) {
	selectedGroup.set(JSON.parse(storedGroup));
} else {
	selectedGroup.set(null);
}
selectedGroup.subscribe((value) => {
	localStorage.setItem("selectedGroup", JSON.stringify(value));
});
