<script lang="ts">
	import { selectedPage } from "../../store/ui.store";
	import { selectedGroup } from "../../store/group.store";
	import { selectedFolder } from "../../store/folder.store";
	import MultipleFolders from "./icons/multipleFolders.svelte";
	import GroupIcon from "./icons/groupIcon.svelte";
	const select = async (choice: string) => {
		selectedPage.set(choice);
		selectedGroup.set(null);
		selectedFolder.set(null);
	};
</script>

<div class="flex justify-center w-[90%]">
	<div
		class="inline-flex justify-center space-x-1 p-0.5 bg-osvauld-frameblack border border-osvauld-iconblack rounded-xl w-full"
	>
		{#each ["Folders", "Groups"] as item}
			<button
				class="transition-colors duration-75 ease-in w-1/2 px-3 py-1.5 text-lg flex justify-center items-center rounded-lg focus:outline-none {$selectedPage ===
				item
					? 'bg-osvauld-sideListHighlight text-osvauld-plainwhite'
					: 'text-osvauld-quarzowhite'} "
				on:click="{() => select(item)}"
			>
				{#if item === "Folders"}
					<MultipleFolders
						color="{$selectedPage === 'Folders' ? 'white' : '#85889C'}"
					/>
				{:else}
					<GroupIcon color="{$selectedPage === item ? 'white' : '#85889C'}" />
				{/if}
				<span class="ml-2 text-base font-light">{item}</span>
			</button>
		{/each}
	</div>
</div>
