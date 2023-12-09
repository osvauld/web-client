<script lang="ts">
  import { selectedPage } from "../../store/ui.store.js";
  import FolderSideList from "./FolderSideList.svelte";
  import GroupSideList from "./GroupSideList.svelte";
</script>

{#if $selectedPage === "Credentials"}
  <FolderSideList />
{:else if $selectedPage === "Groups"}
  <GroupSideList />
{/if}
