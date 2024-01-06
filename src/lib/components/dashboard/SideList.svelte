<script lang="ts">
  import { selectedPage } from "./store";
  import FolderSideList from "./folders/FolderSideList.svelte";
  import GroupSideList from "./groups/GroupSideList.svelte";
</script>

{#if $selectedPage === "Credentials"}
  <FolderSideList />
{:else if $selectedPage === "Groups"}
  <GroupSideList />
{/if}
