<script lang="ts">
	import { onMount } from "svelte";
	import {
		updateCredentialStore,
		resetCredentialStore,
	} from "./credentialTypes/credentialStore";
	import CredentialForm from "./credentialTypes/CredentialForm.svelte";
	import {
		addCredential,
		updateCredential,
		fetchCredentialUsersForDataSync,
		fetchFolderUsersForDataSync,
	} from "../apis";
	import { selectedFolder } from "../store";
	import { Folder } from "../../../dtos/folder.dto";
	import { AddCredentialPayload } from "../dtos";

	export let edit: boolean = false;
	export let credentialId: string = "";

	onMount(async () => {
		if (edit && credentialId) {
			const responseJson = await fetchCredentialUsersForDataSync(credentialId);
			updateCredentialStore({ usersToShare: responseJson.data });
		} else {
			const folder = $selectedFolder as Folder | undefined;
			if (folder === undefined) {
				throw new Error("Folder not selected");
			}
			const responseJson = await fetchFolderUsersForDataSync(
				$selectedFolder.id,
			);
			updateCredentialStore({ usersToShare: responseJson.data });
		}
	});

	const handleSubmit = async (credentialData: AddCredentialPayload) => {
		if (edit) {
			await updateCredential(credentialData, credentialId);
		} else {
			await addCredential(credentialData);
		}
		// Close dialog or navigate away
	};

	const handleCancel = () => {
		resetCredentialStore();
		// Close dialog or navigate away
	};
</script>

<CredentialForm {edit} onSubmit="{handleSubmit}" onCancel="{handleCancel}" />
