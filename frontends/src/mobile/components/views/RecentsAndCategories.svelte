<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { sendMessage } from "../../../lib/components/dashboard/helper";
	import { currentVault } from "../../store/mobile.ui.store";
	import { listen, UnlistenFn } from "@tauri-apps/api/event";
	import RegretFace from "../../../icons/regretFace.svelte";
	import Menu from "../../../icons/Menu.svelte";
	import {
		currentLayout,
		credentialLayoutType,
		selectedCredential,
	} from "../../store/mobile.ui.store";
	import {
		CATEGORIES,
		renderRelevantHeading,
	} from "../../../utils/CredentialUtils";

	let credentials: any[] = [];
	let loading = false;
	let isRecents = true;
	let unlisten: UnlistenFn;

	// This async function handles fetching and processing notes
	async function fetchNotes(vaultId: string) {
		loading = true;
		try {
			credentials = await sendMessage("getCredentialsForFolder", {
				folderId: vaultId,
			});
			loading = false;
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
					fetchNotes($currentVault.id);
				}
			});
		} catch (error) {
			console.error("Error setting up sync listener:", error);
		}
	}

	// Watch for vault changes
	$: if ($currentVault?.id) {
		fetchNotes($currentVault.id);
	}

	// Initial setup on mount
	onMount(() => {
		if ($currentVault?.id) {
			fetchNotes($currentVault.id);
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
				? 'text-mobile-textActive border-b-2 border-osvauld-carolinablue'
				: 'text-mobile-textSecondary'}"
			on:click="{() => (isRecents = !isRecents)}">
			Recents
		</button>
		<button
			class="flex-1 h-[48px] text-center {!isRecents
				? 'text-mobile-textActive border-b-2 border-osvauld-carolinablue'
				: 'text-mobile-textSecondary'}"
			on:click="{() => (isRecents = !isRecents)}">
			Categories
		</button>
	</div>
</div>
{#if loading}
	<div
		class="w-full h-full flex justify-center items-center text-mobile-textPrimary text-base font-light">
		<div class="flex flex-col justify-center items-center gap-4">
			<span class="">Loading</span>
		</div>
	</div>
{:else if credentials.length === 0}
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
	<div class="grid grid-cols-1 gap-3 p-4 overflow-y-scroll overflow-x-hidden">
		{#each credentials as credential}
			{@const credentialType = credential.data.credentialType}
			{@const categoryInfo = CATEGORIES.find(
				(item) => item.type === credentialType,
			)}
			<button
				class="p-3 bg-mobile-bgSeconary rounded-xl font-normal flex justify-start items-center gap-3"
				on:click="{() => {
					selectedCredential.set(credential);
					credentialLayoutType.set('view');
					currentLayout.set('credential');
				}}">
				<span class="flex justify-center items-center p-2">
					<!-- <MobileKey /> -->
					<svelte:component this="{categoryInfo.icon}" color="{'#BFC0CC'}" />
				</span>
				<div class="flex flex-col">
					<h3
						class="text-base text-left text-mobile-textbright truncate max-w-[16rem]">
						{renderRelevantHeading(
							credential.data.credentialFields,
							credentialType,
							credential.id,
						)}
					</h3>
					<span class="text-xs text-left text-mobile-textPrimary"
						>{credentialType}
					</span>
				</div>
				<button
					class="ml-auto p-3 flex justify-center items-center"
					on:click|stopPropagation="{() =>
						console.log('Propagation is not allowed here')}">
					<Menu />
				</button>
			</button>
		{/each}
	</div>
{:else if !isRecents}
	<div
		class="my-3 text-base grid grid-cols-2 gap-3 p-3 text-mobile-textPrimary">
		{#each CATEGORIES as category (category.id)}
			<button
				class="border border-mobile-bgHighlight bg-mobile-bgSeconary rounded-lg px-3 py-2.5 h-[90px]
					   active:bg-mobile-bgHighlight/10 transition-colors touch-manipulation">
				<div class="flex flex-col h-full items-start justify-center gap-1 p-3">
					{#if category.icon}
						<span class="flex justify-center items-center">
							<svelte:component this="{category.icon}" color="{'#BFC0CC'}" />
						</span>
					{/if}
					<span class="text-center text-base leading-tight"
						>{category.type}</span>
					<span class="text-xs">0 items</span>
				</div>
			</button>
		{/each}
	</div>
{/if}
