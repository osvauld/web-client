<script lang="ts">
  import { onMount } from "svelte";
  import LeftContainer from "./components/dashboard/LeftContainer.svelte";
  import RightContainer from "./components/dashboard/RightContainer.svelte";
  import { fetchAllFolders } from "./apis/folder.api";
  import { folderStore } from "./store/folder.store";
  import FolderMenu from "./components/dashboard/folders/FolderMenu.svelte";
  import { showFolderMenu } from "./store/ui.store";
  onMount(async () => {
    const responseJson = await fetchAllFolders();
    folderStore.set(responseJson.data);
  });
</script>

<main
  class="
    bg-osvauld-frameblack
   w-screen h-screen text-macchiato-text text-lg !font-sans"
>
  <div class="flex h-full">
    <div
      class="w-1/5 h-full overflow-y-scroll overflow-x-hidden scrollbar-thin relative z-10"
    >
      <LeftContainer />
    </div>
    <!-- Right container -->
    <div class="w-4/5 h-full overflow-hidden border-l border-osvauld-iconblack">
      <RightContainer />
    </div>
  </div>

  {#if $showFolderMenu}
    <FolderMenu />
  {/if}
</main>
