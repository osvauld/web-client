<script lang="ts">
	import ListToggle from "../../basic/ListToggle.svelte";
	import FolderIcon from "../../basic/icons/folderIcon.svelte";
	import { ModifiedEvent } from "../../../dtos/event.dto";
	import { Folder } from "../../../dtos/folder.dto";

	export let triggerSuccess: boolean = false;
	export let iframeCustomEvent: ModifiedEvent;
	export let isSuccess: boolean;

	let gridDisplay: string;
	let folders: Folder[];
	let loading: boolean = false;

	$: if (iframeCustomEvent) {
		folders = iframeCustomEvent.data.folders;
	}

	const successAnimation = (id: string) => {
		(iframeCustomEvent.source as Window).postMessage(
			{
				save: true,
				folderId: id,
				username: iframeCustomEvent.data.username,
				password: iframeCustomEvent.data.password,
				domain: iframeCustomEvent.data.domain,
			},
			iframeCustomEvent.origin as string,
		);

		loading = true;

		window.addEventListener("message", (event) => {
			if (event.data.id !== "osvauld") {
				return;
			}
			if (event.data.confirmation) {
				isSuccess = event.data.success;
				triggerSuccess = true;
			}
		});
	};
</script>

<div class="w-full h-[80%] py-3 relative">
	<span class="absolute -top-9 right-2">
		<ListToggle bind:value="{gridDisplay}" />
	</span>

	{#if loading}
		<div
			class="w-full h-full text-white text-xl flex justify-center items-center"
		>
			Saving....
		</div>
	{:else if gridDisplay == "Grid"}
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
	{:else if gridDisplay == "List"}
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
