import { writable } from "svelte/store";
import { SelectedGroup } from "../dtos/group.dto";
import { GroupUser } from "../dtos/user.dto";
import { LocalStorageService } from "../../scripts/storageHelper";

export let groupStore = writable<SelectedGroup[]>([]);
export let groupList = writable<SelectedGroup[]>([]);
export let groupUsers = writable<GroupUser[]>([]);
export let selectedGroup = writable<SelectedGroup | null>(null);
const storedGroup: any = LocalStorageService.get("selectedGroup", true);
if (storedGroup) {
	selectedGroup.set(storedGroup);
} else {
	selectedGroup.set(null);
}
selectedGroup.subscribe((value) => {
	LocalStorageService.set("selectedGroup", value, true);
});
