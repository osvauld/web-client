<script lang="ts">
  import CredsListed from "./components/CredsListed.svelte";
  import CredsOpen from "./components/CredsOpen.svelte";
  import { credOpen } from "../../store/ui.store";
  import {
    fetchAllUserUrls,
    fetchCredsByUrl,
  } from "../../apis/credentials.api";
  import browser from "webextension-polyfill";
  import { onMount } from "svelte";

  const openFullscreenTab = async () => {
    // Send a message to the background sdaash
    console.log("Opening fullscreen tab");
    await browser.runtime.sendMessage({ action: "openFullscreenTab" });
  };
  let creds = [];
  onMount(async () => {
    const responseJson = await fetchAllUserUrls();
    console.log("URLS", responseJson.data);
    const urls = responseJson.data;
    await browser.runtime.sendMessage({
      action: "updateAllUrls",
      data: urls,
    });
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const activeTab = tabs[0];
    console.log(activeTab.url);
    const url = new URL(activeTab.url);
    const domain = url.hostname;
    if (urls.includes(domain)) {
      const responseJson = await fetchCredsByUrl(domain);
      creds = responseJson.data;
    }
    console.log(creds);
  });
</script>

<div class="flex justify-center flex-col items-center">
  <button class="bg-red-400 p-4" on:click={openFullscreenTab}
    >Open full screen</button
  >
  <div class="h-[490px] w-11/12 bg-[#2E3654] my-3 overflow-hidden">
    {#each creds as cred}
      {#each cred.unencryptedFields as field}
        {#if !field.isUrl}
          <div class="p-2 text-lg">
            {field.fieldValue}
          </div>
        {/if}
      {/each}
    {/each}
    {#if $credOpen}
      <CredsOpen />
    {:else}
      <CredsListed />
    {/if}
  </div>
</div>
