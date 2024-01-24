<script lang="ts">
  import CredsListed from "./components/CredsListed.svelte";
  import CredsOpen from "./components/CredsOpen.svelte";
  import { credOpen } from "../../store/ui.store";
  import {
    fetchAllUserUrls,
    fetchCredsByIds,
  } from "../../apis/credentials.api";
  import browser from "webextension-polyfill";
  import { onMount } from "svelte";

  const openFullscreenTab = async () => {
    // Send a message to the background sdaash
    console.log("Opening fullscreen tab");
    await browser.runtime.sendMessage({ action: "openFullscreenTab" });
  };

  let credMap = {};
  onMount(async () => {
    let creds = [];
    const responseJson = await fetchAllUserUrls();
    console.log("URLS", responseJson.data);
    const urls = responseJson.data;

    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const activeTab = tabs[0];
    const url = new URL(activeTab.url);
    const domain = url.hostname;
    const { credIds } = await browser.runtime.sendMessage({
      action: "updateAllUrls",
      data: { urls, domain },
    });
    console.log(credIds, "bg-response");
    if (credIds.length > 0) {
      const responseJson = await fetchCredsByIds(credIds);
      creds = responseJson.data;
      console.log(creds, "creds");
    }
    for (let cred of creds) {
      let username = "";
      let password = "";
      for (let field of cred.fields) {
        if (field.fieldName == "Username") {
          const response = await browser.runtime.sendMessage({
            action: "decryptField",
            data: field.fieldValue,
          });
          username = response.data;
        }
        if (field.fieldName == "Password") {
          password = field.fieldValue;
        }
      }
      credMap[cred.credentialId] = { username, password };
    }
  });
</script>

<div class="flex justify-center flex-col items-center">
  <button class="bg-red-400 p-4" on:click={openFullscreenTab}
    >Open full screen</button
  >
  <div class="h-[490px] w-11/12 bg-[#2E3654] my-3 overflow-hidden">
    {#each Object.values(credMap) as { username }}
      <div class="p-2 text-lg">
        {username}
      </div>
    {/each}

    <!-- {#if $credOpen}
      <CredsOpen />
    {:else}
      <CredsListed />
    {/if} -->
  </div>
</div>
