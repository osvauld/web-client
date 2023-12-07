import { writable } from "svelte/store";
type Folder = {
  id: string;
  name: string;
  description: string;
};
export let folderStore = writable<Folder[]>([]);

export let selectedFolder = writable<Folder | null>(null);
