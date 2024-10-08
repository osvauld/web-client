<script lang="ts">
	import { onMount, createEventDispatcher } from "svelte";
	import { setCredentialStore } from "../../../store/storeHelper";
	import {
		fetchCredentialUsersForDataSync,
		fetchFolderUsersForDataSync,
	} from "../apis";
	import { addCredentialHandler } from "./credentialTypes/addCredentialHelper";
	import { updateCredentialHandler } from "./credentialTypes/updateCredentialHelper";
	import { selectedFolder } from "../store";
	import { Folder } from "../../../dtos/folder.dto";
	import {
		isUpdateCredentialPayload,
		isAddCredentialPayload,
		credentialFieldsUpdater,
	} from "./credentialTypes/fieldHelper";

	import CustomCredential from "./credentialTypes/CustomCredential.svelte";
	import { fly, blur } from "svelte/transition";
	import { ClosePanel } from "../icons";

	export let edit: boolean = false;
	export let credentialId: string = "";
	export let name: string = "";
	export let description: string = "";

	let isCredentialNamed = true;
	let credentialType: string = "";
	let isLoaderActive: boolean = false;
	let successView: boolean = false;
	let operationFailed: boolean = false;
	let failureMessage: string = "";
	let credentialFields;
	let usersToShare = [];
	const templateTypes = [
		"Login",
		"Credit/DebitCard",
		"Contact",
		"Digital Wallet",
		"SSH Key",
		"Database",
		"PIN",
		"Note",
		"Bank Account",
		"Social Media",
		"API Key",
	];

	const dispatcher = createEventDispatcher();

	onMount(async () => {
		if (edit && credentialId) {
			const responseJson = await fetchCredentialUsersForDataSync(credentialId);
			usersToShare = responseJson.data;
		} else {
			const folder = $selectedFolder as Folder | undefined;
			if (folder === undefined) {
				throw new Error("Folder not selected");
			}
			const responseJson = await fetchFolderUsersForDataSync(
				$selectedFolder.id,
			);
			usersToShare = responseJson.data;
		}
	});

	const credentialTypeSelection = (type: string) => {
		credentialFields = credentialFieldsUpdater(type);
		credentialType = type;
	};

	const handleSubmit = async (
		credentialFields: any,
		edit: boolean,
		credentialId?: string,
	) => {
		const credentialData = {
			name: name,
			description: description,
			credentialType: credentialType,
			credentialFields: credentialFields,
			usersToShare: usersToShare,
		};

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
			await setCredentialStore();
			isLoaderActive = false;
			successView = true;
			setTimeout(() => {
				successView = false;
			}, 1000);
			dispatcher("close");
		} else {
			operationFailed = true;
			failureMessage = operationResponse.message;
			setTimeout(() => {
				operationFailed = false;
				failureMessage = "";
			}, 1500);
		}
	};

	const handleCancel = () => {
		dispatcher("close");
	};
</script>

<form on:submit|preventDefault="{() => handleSubmit(credentialFields, edit)}">
	<div
		class="bg-osvauld-frameblack rounded-3xl border border-osvauld-iconblack z-50"
		in:fly
		out:blur>
		<div class="flex justify-between items-center px-12 py-6">
			<div>
				<span class="text-[28px] font-sans font-normal"
					>{credentialType === ""
						? "Add secret to Osvauld"
						: `Add ${credentialType}`}</span>
			</div>
			<div>
				<!-- {#if edit}
					<button
						class="bg-osvauld-frameblack p-4"
						on:click="{deleteCredential}"
						type="button"><BinIcon /></button>
				{/if} -->

				<button
					class="bg-osvauld-frameblack p-4"
					on:click="{handleCancel}"
					type="button"><ClosePanel /></button>
			</div>
		</div>
		<div class="border-b border-osvauld-iconblack w-full"></div>

		{#if credentialType !== ""}
			<CustomCredential
				bind:credentialFields
				bind:name
				bind:description
				{edit}
				{isCredentialNamed} />
		{:else}
			<div class="w-full grid grid-cols-2 grid-rows-6 gap-3 pl-4 py-2">
				{#each templateTypes as type}
					<button
						on:click="{() => credentialTypeSelection(type)}"
						type="button"
						class="w-[20rem] p-2 pl-4 text-lg rounded-lg flex items-center cursor-pointer hover:text-osvauld-sideListTextActive hover:bg-osvauld-fieldActive text-osvauld-fieldText'"
						><span class="text-base font-light">{type} </span></button
					>{/each}
			</div>
		{/if}

		{#if failureMessage !== ""}
			<span class="text-red-500 text-base font-normal mr-3 mb-6"
				>{failureMessage}</span>
		{/if}

		<div class="border-b border-osvauld-iconblack w-full my-2"></div>

		<div class="flex justify-end items-center mx-10 py-2">
			<button
				class="px-3 py-1.5 mb-6 whitespace-nowrap text-osvauld-fadedCancel bg-osvauld-frameblack hover:bg-osvauld-cardshade flex justify-center items-center rounded-md hover:text-osvauld-textActive text-base font-normal"
				type="button"
				on:click="{handleCancel}">Cancel</button>
			<button
				type="submit"
				class="px-3 py-1.5 mb-6 whitespace-nowrap flex justify-center items-center ml-3 border border-osvauld-textActive text-osvauld-textActive hover:bg-osvauld-carolinablue hover:text-osvauld-frameblack hover:border-osvauld-carolinablue font-normal text-base rounded-md">
				<span class="w-[8.6rem]"
					>{edit ? "Save Changes" : "Add credential"}</span>
			</button>
		</div>
	</div>
</form>
