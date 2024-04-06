import { writable } from "svelte/store";
import browser from "webextension-polyfill";
export let selectedPage = writable("");
export let isLoggedIn = writable(false);
export let isSignedUp = writable(false);
export let showAddFolderDrawer = writable(false);
export let showAddGroupDrawer = writable(false);
export let showFolderShareDrawer = writable(false);
export let showCredentialShareDrawer = writable(false)
export let showAddUserDrawer = writable(false);
export let allUsersSelected = writable(false);
export let adminStatus = writable(true);
export let showAddUserToGroupDrawer = writable(false);
export let showCredentialDetailsDrawer = writable(false);
export let credentialIdForEdit = writable(null);
export let editPermissionTrigger = writable(false);
export let isPermissionChanged = writable(false);
export let accessSelectorIdentifier = writable(null);
export let buttonRef = writable(null);
export let showMoreOptions = writable(false);
export let menuForFolder = writable({});
export let DeleteConfirmationModal = writable(false);
export let CredentialWillbeDeleted = writable(false);
export let FolderWillBeDeleted = writable(false);

const storedPage = browser.storage.local.get("selectedPage");
storedPage.then((value) => {
    if (value.selectedPage) {
        selectedPage.set(value.selectedPage);
    } else {
        selectedPage.set("Folders");
    }
});
selectedPage.subscribe((value) => {
    browser.storage.local.set({ selectedPage: value });
})