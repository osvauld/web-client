import { writable } from "svelte/store";
export let selectedPage = writable("");
export let showAddFolderDrawer = writable(false);
export let showAddGroupDrawer = writable(false);
export let showFolderShareDrawer = writable(false);
export let showFolderRenameDrawer = writable(false);
export let showCredentialShareDrawer = writable(false);
export let showAddUserDrawer = writable(false);
export let allUsersSelected = writable(false);
export let showAddUserToGroupDrawer = writable(false);
export let showRenameGroupDrawer = writable(false);
export let showCredentialDetailsDrawer = writable(false);
export let credentialIdForEdit = writable(null);
export let buttonRef = writable(null);
export let showMoreOptions = writable(false);
export let modalManager = writable<MoreActions | null>(null);
export let DeleteConfirmationModal = writable(false);
export let showMoreGroupOptions = writable(false);
export let toastStore = writable({ show: false, message: "", type: true });
export let showAddCliDrawer = writable(false);
export let showAddEnvDrawer = writable(false);
export let promptPassword = writable(false);
export let changePassword = writable(false);

type MoreActionsTypes = "Folder" | "Group" | "Credential";
type MoreActions = {
	id: string;
	name: string;
	type: MoreActionsTypes;
	private?: boolean;
};

