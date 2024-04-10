
import { folderStore, selectedFolder } from "./folder.store";
import { groupStore } from "./group.store";
import { credentialStore } from "./credential.store";
import { fetchAllFolders } from "../apis/folder.api";
import { fetchAllUserGroups } from "../apis/group.api";
import { fetchCredentialsByFolder } from "../apis/credentials.api";
import { sendMessage } from "../components/dashboard/helper";
import { get } from 'svelte/store';

export const setFolderStore = async () => {
    const responseJson = await fetchAllFolders();
    const sortedData = responseJson.data.sort((a, b) => a.name.localeCompare(b.name));

    folderStore.set(sortedData);
}

export const setGroupStore = async () => {
    const responseJson = await fetchAllUserGroups();
    const sortedData = responseJson.data.sort((a, b) => a.name.localeCompare(b.name));
    groupStore.set(sortedData);
}

export const setCredentialStore = async () => {
    const selectedFolderValue = get(selectedFolder);
    if (!selectedFolderValue) {
        return;
    }
    const responseJson = await fetchCredentialsByFolder(selectedFolderValue.id);
    if (!responseJson.data) {
        credentialStore.set([])
        return;
    }
    const response = await sendMessage("decryptMeta", responseJson.data);
    credentialStore.set(response.data);
}