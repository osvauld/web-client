<script lang="ts">
	import { credentialStore } from "./credentialStore";
	import type { CredentialStoreData } from "./credentialStore";
	import LoginCredential from "./LoginCredential.svelte";
	import CustomCredential from "./CustomCredential.svelte";
	import NoteCredential from "./NoteCredential.svelte";

	export let edit = false;
	export let onSubmit: (data: CredentialStoreData) => Promise<void>;
	export let onCancel: () => void;

	$: credentialComponent = {
		Login: LoginCredential,
		Custom: CustomCredential,
		Note: NoteCredential,
	}[$credentialStore.credentialType];

	const handleSubmit = () => {
		// Validation logic
		onSubmit($credentialStore);
	};
</script>

// Create a separate CredentialForm component that handles the common form
elements and logic. This component can be used for both adding and editing
credentials.

<form on:submit|preventDefault="{handleSubmit}">
	<input
		bind:value="{$credentialStore.name}"
		placeholder="Enter Credential name..." />

	<svelte:component
		this="{credentialComponent}"
		bind:credentialFields="{$credentialStore.credentialFields}"
		{edit} />

	<textarea
		bind:value="{$credentialStore.description}"
		placeholder="Enter description about the secret"></textarea>

	<button type="submit">
		{edit ? "Save Changes" : "Add credential"}
	</button>
	<button on:click="{onCancel}">Cancel</button>
</form>
