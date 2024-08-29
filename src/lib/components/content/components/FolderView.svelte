<script lang="ts">
	import ListToggle from "../../basic/ListToggle.svelte";
	import FolderIcon from "../../basic/icons/folderIcon.svelte";

	let gridDisplay;
	export let triggerSuccess = false;
	export let globalEvent;
	let folders;

	$: if (globalEvent) {
		folders = globalEvent.data.folders;
	}

	const successAnimation = (id) => {
		console.log("Folder selected", globalEvent, id);
		triggerSuccess = true;
	};
</script>

<div class="w-full h-[80%] py-3 relative">
	<span class="absolute -top-9 right-2">
		<ListToggle bind:value="{gridDisplay}" />
	</span>
	{#if gridDisplay == "Grid"}
		<div
			class="grid grid-cols-2 max-h-[160px] pb-4 overflow-y-scroll scrollbar-thin"
		>
			{#each folders as folder}
				<button
					class=" flex gap-2 w-full overflow-x-hidden justify-start items-center hover:bg-osvauld-fieldActive pl-3"
					on:click="{() => successAnimation(folder.id)}"
				>
					<FolderIcon color="{'#F2F2F0'}" />
					<span
						class="py-2 text-sm max-w-[80%] overflow-hidden whitespace-nowrap text-ellipsis"
						>{folder.name}</span
					>
				</button>
			{/each}
		</div>
	{:else}
		<ul
			class="grid grid-cols-1 max-h-[160px] pb-4 overflow-y-scroll scrollbar-thin"
		>
			{#each folders as folder}
				<button
					class="flex gap-2 w-full justify-start overflow-x-hidden items-center hover:bg-osvauld-fieldActive pl-3"
					on:click="{() => successAnimation(folder.id)}"
				>
					<FolderIcon color="{'#F2F2F0'}" />
					<span
						class="py-2 text-sm max-w-[90%] overflow-hidden whitespace-nowrap text-ellipsis"
						>{folder.name}</span
					>
				</button>
			{/each}
		</ul>
	{/if}
</div>
