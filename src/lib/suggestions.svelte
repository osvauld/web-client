<script lang="ts">
	import FolderView from "./components/content/components/FolderView.svelte";
	import PermissionView from "./components/content/components/PermissionView.svelte";

	let folderView = true;
</script>

<div
	class="w-full h-[200px] bg-osvauld-frameblack text-base text-white overflow-hidden"
>
	<span class="font-extrabold text-2xl text-white pb-4">osvauld</span>
	{#if folderView}
		<FolderView />
	{:else}
		<PermissionView bind:value="{folderView}" />
	{/if}
</div>
