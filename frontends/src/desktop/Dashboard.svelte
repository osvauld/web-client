<script lang="ts">
	import { onMount } from "svelte";
	import Loader from "../lib/components/dashboard/components/Loader.svelte";

	import { invoke } from "@tauri-apps/api/core";
	import { sendMessage } from "../lib/components/dashboard/helper";
	import Welcome from "../lib/components/popup/Welcome.svelte";
	import Signup from "../lib/components/popup/Signup.svelte";
	import Toast from "./components/ui/Toast.svelte";
	import { setFolderStore } from "../lib/store/storeHelper";
	import PasswordPromptModal from "../lib/components/dashboard/components/PasswordPromptModal.svelte";
	import { LocalStorageService } from "../utils/storageHelper";
	import DefaultLayout from "./components/layout/DefaultLayout.svelte";
	import AddCredentialModal from "./components/views/AddCredentialModal.svelte";
	import {
		addCredentialModal,
		credentialEditorModal,
		profileModal,
		viewCredentialModal,
		deleteConfirmationModal,
		toastStore,
	} from "./components/store/desktop.ui.store";
	import ProfileView from "./components/views/ProfileView.svelte";
	import CredentialEditorModal from "./components/views/CredentialEditorModal.svelte";
	import CredentialViewModal from "./components/views/CredentialViewModal.svelte";
	import DeleteConfirmationModal from "./components/ui/DeleteConfirmationModal.svelte";

	let showWelcome = false;
	let signedUp = false;
	let isLoading = true;

	onMount(async () => {
		try {
			const response = await sendMessage("isSignedUp");
			console.log(response);
			const checkPvtLoad = await sendMessage("checkPvtLoaded");
			signedUp = response.isSignedUp;
			if (checkPvtLoad === false) {
				showWelcome = true;
			} else {
				await setFolderStore();
			}
		} catch (error) {
			console.error("Error during initialization:", error);
		} finally {
			isLoading = false;
		}
	});

	const handleSignedUp = () => {
		signedUp = true;
		showWelcome = false;
	};

	const handleAuthenticated = async () => {
		await setFolderStore();
		showWelcome = false;
	};
</script>

<style>
	:root {
		overflow: hidden;
	}
</style>

<main
	class="
    bg-osvauld-frameblack
   w-screen h-screen text-macchiato-text text-lg !font-sans">
	{#if isLoading}
		<div class="flex justify-center items-center w-full h-full">
			<Loader size="{24}" color="#1F242A" duration="{1}" />
		</div>
	{:else if !signedUp}
		<Signup on:signedUp="{handleSignedUp}" />
	{:else if showWelcome}
		<div class="overflow-hidden flex justify-center items-center w-full h-full">
			<Welcome on:authenticated="{handleAuthenticated}" />
		</div>
	{:else}
		<DefaultLayout />

		<!-- AddCredentialModal opens up folder or/and category type selection modal -->
		{#if $addCredentialModal}
			<AddCredentialModal />
		{/if}

		<!-- Actual credential entering happens here in CredentialEditorModal-->
		{#if $credentialEditorModal}
			<CredentialEditorModal />
		{/if}

		{#if $viewCredentialModal}
			<CredentialViewModal />
		{/if}

		{#if $viewCredentialModal}
			<CredentialViewModal />
		{/if}
		{#if $deleteConfirmationModal}
			<DeleteConfirmationModal />
		{/if}

		{#if $profileModal}
			<ProfileView />
		{/if}

		<!-- {#if $showMoreOptions}
			<MoreActions />
		{/if}
		{#if $promptPassword}
			<PasswordPromptModal />
		{/if}
		{#if $modalManager}
			{#if $DeleteConfirmationModal && $modalManager.type === "Credential"}
				<CredentialDeleteModal />
			{:else if $DeleteConfirmationModal && $modalManager.type === "Folder"}
				<FolderDeleteModal />
			{/if}
		{/if}

	
		-->
		{#if $toastStore.show}
			<div class="z-100">
				<Toast />
			</div>
		{/if}
	{/if}
</main>
