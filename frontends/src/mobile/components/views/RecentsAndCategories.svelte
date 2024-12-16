<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { sendMessage } from "../../../lib/components/dashboard/helper";
	import { currentVault } from "../../store/mobile.ui.store";
	import { listen, UnlistenFn } from "@tauri-apps/api/event";
	import RegretFace from "../../../icons/regretFace.svelte";
	import CategoriesFilter from "./CategoriesFilter.svelte";
	import CredentialList from "./CredentialList.svelte";

	let credentials: any[] = [];
	let isRecents = true;
	let credentialsLoaded = false;

	let unlisten: UnlistenFn;

	// This async function handles fetching and processing notes
	async function fetchCredentials(vaultId: string) {
		try {
			const t0 = performance.now();
			credentials = await sendMessage("getCredentialsForFolder", {
				folderId: vaultId,
			});
			credentialsLoaded = true;
			const t1 = performance.now();
			console.log(`Call to getCredentialsForFolder took ${t1 - t0}`);
		} catch (error) {
			console.error("Error fetching notes:", error);
			credentials = [];
		}
	}

	// Setup event listener for sync-complete
	async function setupSyncListener() {
		try {
			unlisten = await listen("sync-completed", (event) => {
				if (event.payload === true && $currentVault?.id) {
					console.log("Sync completed, refreshing notes...");
					fetchCredentials($currentVault.id);
				}
			});
		} catch (error) {
			console.error("Error setting up sync listener:", error);
		}
	}

	// Watch for vault changes
	$: if ($currentVault?.id) {
		fetchCredentials($currentVault.id);
	}

	// Initial setup on mount
	onMount(() => {
		if ($currentVault?.id) {
			fetchCredentials($currentVault.id);
		}
		setupSyncListener();
	});

	// Cleanup on component destruction
	onDestroy(() => {
		if (unlisten) {
			unlisten();
		}
	});
</script>

<div class="w-full h-[40px] flex justify-between items-center px-4">
	<div class="w-full flex border-b border-mobile-bgHighlight">
		<button
			class="flex-1 h-[48px] text-center {isRecents
				? 'text-osvauld-carolinablue border-b-2 border-osvauld-carolinablue'
				: 'text-mobile-textSecondary'}"
			on:click="{() => (isRecents = !isRecents)}">
			Recents
		</button>
		<button
			class="flex-1 h-[48px] text-center {!isRecents
				? 'text-osvauld-carolinablue border-b-2 border-osvauld-carolinablue'
				: 'text-mobile-textSecondary'}"
			on:click="{() => (isRecents = !isRecents)}">
			Categories
		</button>
	</div>
</div>

{#if credentials.length === 0 && credentialsLoaded}
	<div
		class="w-full h-full flex justify-center items-center text-mobile-textPrimary text-base font-light">
		<div class="flex flex-col justify-center items-center gap-4">
			<span>
				<RegretFace size="{64}" />
			</span>
			<span> Unable to find associated credentials </span>
		</div>
	</div>
{:else if isRecents}
	<CredentialList {credentials} />
{:else if !isRecents}
	<CategoriesFilter {credentials} />
{/if}
