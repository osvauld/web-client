import { writable } from "svelte/store";

type Group = {
  id: string;
  name: string;
};

export let groupStore = writable<Group[]>([]);

export let selectedGroup = writable<Group | null>(null);
