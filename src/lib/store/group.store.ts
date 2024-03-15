import { writable } from "svelte/store";
import { Group } from "../dtos/group.dto";
import { User } from "../dtos/user.dto";

export let groupStore = writable<Group[]>([]);
export let groupList = writable<Group[]>([]);
export let groupUsers = writable<User[]>([]);
export let selectedGroup = writable<Group | null>(null);
