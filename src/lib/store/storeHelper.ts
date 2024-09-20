import { folderStore, selectedFolder, envStore } from "./folder.store";
import { groupStore } from "./group.store";
import { credentialStore } from "./credential.store";
import { fetchAllFolders, getEnvironments } from "../apis/folder.api";
import { fetchAllUserGroups } from "../apis/group.api";
import { fetchCredentialsByFolder } from "../apis/credentials.api";
import { sendMessage } from "../components/dashboard/helper";
import { get } from "svelte/store";
import { selectedSection } from "./ui.store";
import { SelectedGroup } from "../dtos/group.dto";
import { Folder } from "../dtos/folder.dto";
import { getUser } from "../apis/user.api";
import { User } from "../dtos/user.dto";
export const setFolderStore = async () => {
	const responseJson = await fetchAllFolders();
	const sortedData = responseJson.data.sort((a: Folder, b: Folder) =>
		a.name.localeCompare(b.name),
	);
	const selectedFolderValue = get(selectedFolder);
	if (!selectedFolderValue) {
		const storedFolder = localStorage.getItem("selectedFolder");
		if (storedFolder && storedFolder != "undefined") {
			const stored = JSON.parse(storedFolder);
			for (const folder of sortedData) {
				if (folder.id === stored.id) {
					selectedFolder.set(folder);
					if (folder.type === "private") {
						selectedSection.set("PrivateFolders");
					}
					return;
				}
			}
		}
	}
	folderStore.set(sortedData);
};

export const setGroupStore = async () => {
	const responseJson = await fetchAllUserGroups();
	const sortedData = responseJson.data.sort(
		(a: SelectedGroup, b: SelectedGroup) => a.name.localeCompare(b.name),
	);
	groupStore.set(sortedData);
};

export const setCredentialStore = async () => {
	const selectedFolderValue = get(selectedFolder);
	if (!selectedFolderValue) {
		return;
	}
	const responseJson = await fetchCredentialsByFolder(selectedFolderValue.id);
	if (!responseJson.data) {
		credentialStore.set([]);
		return;
	}
	const response = await sendMessage("decryptMeta", responseJson.data);
	credentialStore.set(response);
};

export const setEnvStore = async () => {
	const responseJson = await getEnvironments();
	const envs = responseJson.data;
	envStore.set(envs);
};
export const getUserDetails = async (): Promise<User> => {
	const accountDetails = localStorage.getItem("user");
	let user;
	if (accountDetails == null) {
		const userJson = await getUser();
		user = userJson.data;
		localStorage.setItem("user", JSON.stringify(user));
	} else {
		user = JSON.parse(accountDetails);
	}
	return user;
};
