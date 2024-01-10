<script lang="ts">
  import { onMount } from "svelte";
  import LeftContainer from "./components/dashboard/LeftContainer.svelte";
  import RightContainer from "./components/dashboard/RightContainer.svelte";
  import { fetchAllFolders } from "./apis/folder.api";
  onMount(() => {
    fetchAllFolders();
  });
</script>

<main
  class="
    bg-osvauld-frameblack
   w-screen h-screen text-macchiato-text text-lg"
>
  <div class="flex h-full">
    <div class="w-1/5 overflow-auto scrollbar-thin">
      <LeftContainer />
    </div>
    <!-- Right container -->
    <div class="w-4/5 overflow-auto scrollbar-thin">
      <RightContainer />
    </div>
  </div>
</main>
