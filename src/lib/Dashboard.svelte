<script>
  import { onMount } from "svelte";
  import LeftContainer from "./components/dashboard/LeftContainer.svelte";
  import { fetchAllFolders } from "./apis/folder.ts";
  onMount(() => {
    fetchAllFolders();
  });
</script>

<main class="bg-gradient-to-b from-[#262732] to-[#182034] w-screen h-screen">
  <div class="flex h-full">
    <div class="w-1/6 overflow-auto">
      <LeftContainer />
    </div>

    <!-- Vertical line -->
    <div class="w-px bg-[#04070c]" style="flex-grow: 0;"></div>

    <!-- Right container -->
    <div class="w-5/6"></div>
  </div>
</main>
