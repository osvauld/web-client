import { writable } from "svelte/store";
import { Group } from "../dtos/group.dto";

export let groupStore = writable<Group[]>([]);
export let groupList = writable<Group[]>([]);

export let selectedGroup = writable<Group | null>(null);
