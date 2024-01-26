<script lang="ts">
  import {
    fetchAllUserUrls,
    fetchCredsByIds,
  } from "../../apis/credentials.api";
  import browser from "webextension-polyfill";
  import { onMount } from "svelte";
  import { Maximize, Lens, ClosePanel, Add } from './icons';

  const openFullscreenTab = async () => {
    // Send a message to the background sdaash
    console.log("Opening fullscreen tab");
    await browser.runtime.sendMessage({ action: "openFullscreenTab" });
  };

  type CredMap = {
    [key: string]: {
      username: string;
      password: string;
    };
  };
  let credMap: CredMap = {};
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

<div class="w-full h-full">
  <div class="flex justify-between items-center mb-3">
    <h6 class="text-2xl font-medium text-osvauld-highlightwhite tracking-wide">osvauld</h6>
    <div>
      <button class="" on:click={openFullscreenTab}>
        <Maximize />
      </button>
      <button class="ml-5"> 
        <ClosePanel/>
      </button>
    </div>
  </div>

  <div class="rounded-lg border border-osvauld-iconblack w-full min-h-[15rem] max-h-[33rem] p-4">
    <div
        class="h-9 w-full px-2 mx-auto flex justify-start items-center border border-osvauld-iconblack rounded-lg cursor-pointer mb-4"
    >
        <Lens />
        <input
            type="text"
            class="h-7 w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-sm font-light focus:border-transparent focus:ring-0 cursor-pointer"
            placeholder="Find what you need faster.."
        />
    </div>
    <div class="bg-osvauld-bordergreen rounded-lg">
      <div>
        <span class="text-lg text-osvauld-quarzowhite">No passwords found!</span>
        <p>Current page doesn't have a password in osvauld.</p>
      </div>
      <button
      class="bg rounded-md py-1 px-4 mr-2 bg-osvauld-carolinablue text-macchiato-surface0 flex justify-center items-center whitespace-nowrap"
      >
       <span class="mr-1"> Add Credential</span>
        <Add />
      </button>

    </div>
    <!-- {#each Object.values(credMap) as { username }}
      <div class="p-2 text-lg">
        {username}
      </div>
    {/each} -->
    <!-- {#if $credOpen}
      <CredsOpen />
    {:else}
      <CredsListed />
    {/if} -->
  </div>
</div>
