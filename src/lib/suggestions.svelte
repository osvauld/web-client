<script lang="ts">
	import { onMount } from "svelte";
	import SuccessTick from "./components/basic/SuccessTick.svelte";
	import FolderView from "./components/content/components/FolderView.svelte";
	import PermissionView from "./components/content/components/PermissionView.svelte";

	let folderView = false;
	let successView = false;
	let isSuccess = false;
	let globalEvent;

	onMount(async () => {
		window.addEventListener("message", (event) => {
			if (event.data.id !== "osvauld") {
				return;
			}
			globalEvent = {
				data: event.data,
				source: event.source,
				origin: event.origin,
			};
		});
	});
</script>

<div
	class="w-full h-[200px] bg-osvauld-frameblack text-base text-white overflow-hidden"
>
	<span class="font-extrabold text-2xl text-white pb-4">osvauld</span>
	{#if successView}
		<SuccessTick {isSuccess} {globalEvent} />
	{:else if folderView}
		<FolderView
			{globalEvent}
			bind:isSuccess
			bind:triggerSuccess="{successView}"
		/>
	{:else}
		<PermissionView {globalEvent} bind:value="{folderView}" />
	{/if}
</div>
