<script lang="ts">
	import { onMount } from "svelte";
	import LeftContainer from "../lib/components/dashboard/LeftContainer.svelte";
	import RightContainer from "../lib/components/dashboard/RightContainer.svelte";
	import MoreActions from "../lib/components/dashboard/components/MoreActions.svelte";
	import CredentialDeleteModal from "../lib/components/dashboard/credentials/CredentialDeleteModal.svelte";
	import FolderDeleteModal from "../lib/components/dashboard/folders/FolderDeleteModal.svelte";
	import Loader from "../lib/components/dashboard/components/Loader.svelte";
	import {
		showMoreOptions,
		DeleteConfirmationModal,
		modalManager,
		toastStore,
		promptPassword,
	} from "../lib/store/ui.store";
	import { invoke } from "@tauri-apps/api/core";
	import { sendMessage } from "../lib/components/dashboard/helper";
	import Welcome from "../lib/components/popup/Welcome.svelte";
	import Signup from "../lib/components/popup/Signup.svelte";
	import ShareToast from "../lib/components/dashboard/components/ShareToast.svelte";
	import { setFolderStore } from "../lib/store/storeHelper";
	import PasswordPromptModal from "../lib/components/dashboard/components/PasswordPromptModal.svelte";
	import { LocalStorageService } from "../utils/storageHelper";
	import DefaultLayout from "../lib/components/desktop/layout/DefaultLayout.svelte";

	let showWelcome = false;
	let signedUp = false;
	let isLoading = true;

	onMount(async () => {
		try {
			const response = await sendMessage("isSignedUp");
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
		<!-- <div class="flex h-full">
			<div
				class="w-1/5 h-full scrollbar-thin overflow-y-hidden overflow-x-hidden relative z-10">
				<LeftContainer />
			</div>
			<div
				class="w-4/5 min-w-[330px] h-full overflow-hidden border-l border-osvauld-iconblack">
				<RightContainer />
			</div>
		</div>

		{#if $showMoreOptions}
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

		{#if $toastStore.show}
			 {#if true}
			<div class="z-100">
				<ShareToast />
			</div>
		{/if}
        -->
	{/if}
</main>
