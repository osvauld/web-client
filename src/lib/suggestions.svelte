<script lang="ts">
	import FolderView from "./components/content/components/FolderView.svelte";
	import PermissionView from "./components/content/components/PermissionView.svelte";

	let folderView = false;

	const viewManager = (e) => {
		folderView = e.detail;
	};
</script>

<div class="w-full h-[15rem] bg-osvauld-frameblack text-base text-white">
	<span class="font-extrabold text-2xl text-white pb-4">osvauld</span>
	{#if folderView}
		<FolderView />
	{:else}
		<PermissionView on:save="{viewManager}" />
	{/if}
</div>
