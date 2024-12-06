<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { sendMessage } from "../../../lib/components/dashboard/helper";
	import { currentVault } from "../../store/mobile.ui.store";
	import { listen, UnlistenFn } from "@tauri-apps/api/event";

	let notes: any[] = [];
	let unlisten: UnlistenFn;

	// This async function handles fetching and processing notes
	async function fetchNotes(vaultId: string) {
		try {
			const responseJson = await sendMessage("getCredentialsForFolder", {
				folderId: vaultId,
			});
			notes = responseJson
				.map((note) => {
					const nameField = note.data.credentialFields.find(
						(field) => field.fieldName === "Name",
					);
					const noteField = note.data.credentialFields.find(
						(field) => field.fieldName === "Note",
					);
					return {
						id: note.id,
						title: nameField?.fieldValue || note.data.name,
						content: noteField?.fieldValue || note.data.description,
						date: new Date().toLocaleDateString(),
					};
				})
				.reverse();
		} catch (error) {
			console.error("Error fetching notes:", error);
			notes = [];
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

<div class="grid grid-cols-1 gap-3 p-4">
	{#each notes as note (note.id)}
		<div
			class="border border-mobile-bgHighlight bg-mobile-bgSeconary rounded-lg p-3 h-[180px] flex flex-col overflow-hidden">
			<div class="flex justify-between items-center mb-2">
				<h3 class="text-mobile-textPrimary text-base font-medium truncate">
					{note.title}
				</h3>
				<span class="text-xs text-mobile-textSecondary flex-shrink-0 ml-2">
					{note.date}
				</span>
			</div>
			<p
				class="text-sm text-mobile-textSecondary grow overflow-y-auto scrollbar-thin scrollbar-thumb-mobile-bgHighlight scrollbar-track-transparent">
				{note.content}
			</p>
		</div>
	{/each}
</div>
