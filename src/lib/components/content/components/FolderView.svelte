<script lang="ts">
	import { onMount } from "svelte";
	import ListToggle from "../../basic/ListToggle.svelte";
	import FolderIcon from "../../basic/icons/folderIcon.svelte";

	let gridDisplay;
	let buttonCount = 5; // default number of buttons

	onMount(() => {
		console.log("Mounted Folder view");
	});

	// Helper function to generate an array of a given size
	function generateButtons(count: number): number[] {
		return Array.from({ length: count }, (_, i) => i + 1);
	}
</script>

<div class="w-full h-[80%] py-3 relative">
	<span class="absolute -top-9 right-2">
		<ListToggle bind:value="{gridDisplay}" />
	</span>
	{#if gridDisplay == "Grid"}
		<div
			class="grid grid-cols-2 max-h-[160px] pb-4 overflow-y-scroll scrollbar-thin"
		>
			{#each generateButtons(buttonCount) as button}
				<button
					class=" flex gap-2 w-full overflow-x-hidden justify-start items-center hover:bg-osvauld-fieldActive pl-3"
				>
					<FolderIcon color="{'#F2F2F0'}" />
					<span
						class="py-2 text-sm max-w-[80%] overflow-hidden whitespace-nowrap text-ellipsis"
						>looooongggggggggggggggggggggggggggggggggggggg {button}</span
					>
				</button>
			{/each}
		</div>
	{:else}
		<ul
			class="flex flex-col max-h-[160px] pb-4 overflow-y-scroll scrollbar-thin"
		>
			{#each generateButtons(buttonCount) as button}
				<button
					class="flex gap-2 w-full overflow-x-hidden justify-start items-center hover:bg-osvauld-fieldActive pl-3"
				>
					<FolderIcon color="{'#F2F2F0'}" />
					<span
						class="py-2 text-sm max-w-[90%] overflow-hidden whitespace-nowrap text-ellipsis"
						>looooongggggggggggggggggggggggggggggggggggggg {button}</span
					>
				</button>
			{/each}
		</ul>
	{/if}
</div>
