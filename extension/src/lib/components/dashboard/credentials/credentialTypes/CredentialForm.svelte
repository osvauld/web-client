<script lang="ts">
	import { credentialStore } from "./credentialStore";
	import {
		CredentialStoreData,
		updateCredentialStore,
		CredentialType,
		credentialFieldsStore,
	} from "./credentialStore";
	import LoginCredential from "./LoginCredential.svelte";
	import CustomCredential from "./CustomCredential.svelte";
	import NoteCredential from "./NoteCredential.svelte";
	import { fly, blur } from "svelte/transition";
	import { ClosePanel, Add, BinIcon } from "../../icons";

	export let edit = false;
	let isEnter: boolean;
	let hoveredIndex: number;
	export let failureMessage = "";
	export let isCredentialNamed;
	export let onSubmit;
	export let onCancel: () => void;

	$: credentialComponent = {
		Login: LoginCredential,
		Custom: CustomCredential,
		Note: NoteCredential,
	}[$credentialStore.credentialType];

	const updateCredentialFormat = (type) => {
		let credentialType = type;
		let credentialFields;
		if (credentialType === "Custom") {
			credentialFields = [
				{
					fieldName: "Field Name",
					fieldValue: "",
					sensitive: false,
				},
				{ fieldName: "TOTP", fieldValue: "", sensitive: true },
			];
		} else if (credentialType === "Login") {
			credentialFields = [
				{ fieldName: "Username", fieldValue: "", sensitive: false },
				{ fieldName: "Password", fieldValue: "", sensitive: true },
				{ fieldName: "URL", fieldValue: "https://", sensitive: false },
				{ fieldName: "TOTP", fieldValue: "", sensitive: true },
			];
		} else if (credentialType == "Note") {
			credentialFields = [
				{ fieldName: "Note1", fieldValue: "", sensitive: false },
			];
		}
		credentialFieldsStore.set(credentialFields);
	};

	const credentialTypeSelection = (type: CredentialType) => {
		updateCredentialFormat(type);
		updateCredentialStore({ credentialType: type });
	};

	const handleSubmit = () => {
		updateCredentialStore({ credentialFields: $credentialFieldsStore });
		onSubmit($credentialStore);
	};
</script>

<form on:submit|preventDefault="{handleSubmit}">
	<div
		class="bg-osvauld-frameblack rounded-3xl border border-osvauld-iconblack z-50"
		in:fly
		out:blur>
		<div class="flex justify-between items-center px-12 py-6">
			<div>
				<button
					class="text-[28px] font-sans font-normal {$credentialStore.credentialType ===
					'Login'
						? 'text-osvauld-quarzowhite border-b-2 border-osvauld-carolinablue'
						: 'text-osvauld-sheffieldgrey '}"
					type="button"
					on:click="{() => credentialTypeSelection('Login')}">
					{edit ? "Edit Login" : "Login"}
				</button>
				<button
					class="text-[28px] font-sans font-normal ml-8 {$credentialStore.credentialType ===
					'Custom'
						? 'text-osvauld-quarzowhite border-b-2 border-osvauld-carolinablue'
						: 'text-osvauld-sheffieldgrey '}"
					type="button"
					on:click="{() => credentialTypeSelection('Custom')}">
					{edit ? "Edit Custom" : "Custom"}
				</button>

				<button
					class="text-[28px] font-sans font-normal ml-8 {$credentialStore.credentialType ===
					'Note'
						? 'text-osvauld-quarzowhite border-b-2 border-osvauld-carolinablue'
						: 'text-osvauld-sheffieldgrey '}"
					type="button"
					on:click="{() => credentialTypeSelection('Note')}">
					{edit ? "Edit Note" : "Note"}
				</button>
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
					on:click="{onCancel}"
					type="button"><ClosePanel /></button>
			</div>
		</div>
		<div class="border-b border-osvauld-iconblack w-full"></div>

		<svelte:component
			this="{credentialComponent}"
			{edit}
			{isCredentialNamed}
			{hoveredIndex} />

		{#if failureMessage !== ""}
			<span class="text-red-500 text-base font-normal mr-3 mb-6"
				>{failureMessage}</span>
		{/if}

		<div class="border-b border-osvauld-iconblack w-full my-2"></div>

		<div class="border-b border-osvauld-iconblack w-full my-2"></div>
		<div class="flex justify-end items-center mx-10 py-2">
			<button
				class="px-3 py-1.5 mb-6 whitespace-nowrap text-osvauld-fadedCancel bg-osvauld-frameblack hover:bg-osvauld-cardshade flex justify-center items-center rounded-md hover:text-osvauld-textActive text-base font-normal"
				type="button"
				on:click="{onCancel}">Cancel</button>
			<button
				type="submit"
				class="px-3 py-1.5 mb-6 whitespace-nowrap flex justify-center items-center ml-3 border border-osvauld-textActive text-osvauld-textActive hover:bg-osvauld-carolinablue hover:text-osvauld-frameblack hover:border-osvauld-carolinablue font-normal text-base rounded-md">
				<span class="w-[8.6rem]"
					>{edit ? "Save Changes" : "Add credential"}</span>
			</button>
		</div>
	</div>
</form>
