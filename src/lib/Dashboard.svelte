<script lang="ts">
  import { onMount } from "svelte";
  import LeftContainer from "./components/dashboard/LeftContainer.svelte";
  import RightContainer from "./components/dashboard/RightContainer.svelte";
  import { fetchAllFolders } from "./apis/folder.api";
  onMount(() => {
    fetchAllFolders();
  });
</script>

<main class="bg-[#121212] w-screen h-screen text-white">
  <div class="flex h-full">
    <div class="w-1/6 overflow-auto">
      <LeftContainer />
    </div>

    <!-- Vertical line -->
    <div class="w-px bg-[#04070c]" style="flex-grow: 0;"></div>

    <!-- Right container -->
    <div class="w-5/6 overflow-auto">
      <RightContainer />
    </div>
  </div>
</main>
