<script lang="ts">
	import { onMount } from "svelte";
	import SuccessTick from "./components/basic/SuccessTick.svelte";
	import FolderView from "./components/content/components/FolderView.svelte";
	import PermissionView from "./components/content/components/PermissionView.svelte";

	let folderView = false;
	let successView = false;
	let globalEvent;

	onMount(async () => {
		window.addEventListener("message", (event) => {
			if (event.data.id !== "osvauld") {
				return;
			}
			// const { username } = event.data;
			// usernameContent = username;
			// eventGlobal = event;
			globalEvent = event;
		});
	});
</script>

<div
	class="w-full h-[200px] bg-osvauld-frameblack text-base text-white overflow-hidden"
>
	<span class="font-extrabold text-2xl text-white pb-4">osvauld</span>
	{#if successView}
		<SuccessTick {globalEvent} />
	{:else if folderView}
		<FolderView bind:triggerSuccess="{successView}" />
	{:else}
		<PermissionView {globalEvent} bind:value="{folderView}" />
	{/if}
</div>
