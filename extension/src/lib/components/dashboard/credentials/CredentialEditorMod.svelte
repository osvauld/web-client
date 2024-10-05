<script lang="ts">
	import { onMount, createEventDispatcher } from "svelte";
	import {
		updateCredentialStore,
		resetCredentialStore,
		CredentialStoreData,
		credentialFieldsStore,
		credentialStore,
	} from "./credentialTypes/credentialStore";
	import { setCredentialStore } from "../../../store/storeHelper";
	import CredentialForm from "./credentialTypes/CredentialForm.svelte";
	import {
		fetchCredentialUsersForDataSync,
		fetchFolderUsersForDataSync,
	} from "../apis";
	import { addCredentialHandler } from "./credentialTypes/addCredentialHelper";
	import { updateCredentialHandler } from "./credentialTypes/updateCredentialHelper";
	import { selectedFolder } from "../store";
	import { Folder } from "../../../dtos/folder.dto";
	import {
		AddCredentialPayload,
		UpdateCredentialPayload,
		CredentialFieldComponentProps,
	} from "../dtos";

	export let edit: boolean = false;
	export let credentialId: string = "";
	let isCredentialNamed = true;
	export let name: string = "";
	export let description: string = "";
	export let credentialType: string = "";
	export let credentialFields: CredentialFieldComponentProps[] = [
		{ fieldName: "Username", fieldValue: "", sensitive: false },
		{ fieldName: "Password", fieldValue: "", sensitive: true },
		{ fieldName: "URL", fieldValue: "https://", sensitive: false },
		{ fieldName: "TOTP", fieldValue: "", sensitive: true },
	];
	let isLoaderActive: boolean = false;
	let successView: boolean = false;
	let operationFailed: boolean = false;
	let failureMessage: string = "";

	const dispatcher = createEventDispatcher();

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

	$: console.log("credentialFieldsStore in editorMod", $credentialFieldsStore);

	function isUpdateCredentialPayload(
		data: any,
	): data is UpdateCredentialPayload {
		return "credentialId" in data;
	}

	function isAddCredentialPayload(data: any): data is AddCredentialPayload {
		return !("credentialId" in data);
	}

	const handleSubmit = async (
		credentialData: CredentialStoreData,
		edit: boolean,
		credentialId?: string,
	) => {
		if (credentialData.name.length === 0) {
			isCredentialNamed = false;
			return;
		}
		isLoaderActive = true;
		let operationResponse: {
			success: boolean;
			message: string;
		};
		if (edit && isUpdateCredentialPayload(credentialData)) {
			// need to create addCredentialPaylod.userFields with sendMessage before sending
			operationResponse = await updateCredentialHandler(
				credentialData,
				credentialId!,
			);
		} else if (!edit && isAddCredentialPayload(credentialData)) {
			operationResponse = await addCredentialHandler(
				credentialData,
				$selectedFolder.id,
			);
		}

		if (operationResponse.success) {
			console.log("OPeration success");
			await setCredentialStore();
			isLoaderActive = false;
			successView = true;
			setTimeout(() => {
				successView = false;
			}, 1000);
			dispatcher("close");
		} else {
			console.log("OPeration fail");
			operationFailed = true;
			failureMessage = operationResponse.message;
			setTimeout(() => {
				operationFailed = false;
				failureMessage = "";
			}, 1500);
		}
	};

	const handleCancel = () => {
		resetCredentialStore();
		dispatcher("close");
		// Close dialog or navigate away
	};
</script>

<CredentialForm
	{edit}
	{isCredentialNamed}
	{failureMessage}
	onSubmit="{handleSubmit}"
	onCancel="{handleCancel}" />
