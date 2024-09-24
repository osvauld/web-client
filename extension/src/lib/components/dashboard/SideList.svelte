<script lang="ts">
	import { selectedPage } from "./store";
	import FolderSideList from "./folders/FolderSideList.svelte";
	import GroupSideList from "./groups/GroupSideList.svelte";
	$: console.log($selectedPage, "changed");
</script>

{#if $selectedPage === "Folders"}
	<FolderSideList />
{:else if $selectedPage === "Groups"}
	<GroupSideList />
{/if}
