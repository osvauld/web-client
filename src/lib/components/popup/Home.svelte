<script lang="ts">
  import CredsListed from "./components/CredsListed.svelte";
  import CredsOpen from "./components/CredsOpen.svelte";
  import { credOpen } from "../../store/ui.store";
  import browser from "webextension-polyfill";

  const openFullscreenTab = async () => {
    // Send a message to the background sdaash
    console.log("Opening fullscreen tab");
    await browser.runtime.sendMessage({ action: "openFullscreenTab" });
  };
</script>

<div class="flex justify-center flex-col items-center">
  <button class="bg-red-400 p-4" on:click={openFullscreenTab}
    >Open full screen</button
  >
  <div class="h-[490px] w-11/12 bg-[#2E3654] my-3 overflow-hidden">
    {#if $credOpen}
      <CredsOpen />
    {:else}
      <CredsListed />
    {/if}
  </div>
</div>
