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
		credentialDataCached,
	} from "../../store/mobile.ui.store";
	import {
		CATEGORIES,
		renderRelevantHeading,
	} from "../../../utils/mobileUtils";

	let credentials: any[] = [];
	let loading = false;
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
{:else}
	<div class="grid grid-cols-1 gap-3 p-4 overflow-y-scroll overflow-x-hidden">
		{#each credentials as credential}
			{@const credentialType = credential.data.credentialType}
			{@const categoryInfo = CATEGORIES.find(
				(item) => item.type === credentialType,
			)}
			<button
				class="p-3 bg-mobile-bgSeconary rounded-xl font-normal flex justify-start items-center gap-3"
				on:click="{() => {
					credentialDataCached.set(credential);
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
{/if}
