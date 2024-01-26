<script lang="ts">
  import {
    fetchAllUserUrls,
    fetchCredsByIds,
  } from "../../apis/credentials.api";
  import browser from "webextension-polyfill";
  import { onMount } from "svelte";
  import { Maximize, Lens, ClosePanel, RightArrow, DownArrow, ActiveCopy } from './icons';
  import PasswordNotFound from './components/PasswordNotFound.svelte';


  let passwordFound = true;
  let  credentials = ['username', 'username', 'username','username', 'username', 'username', 'username', 'username', 'username','username', 'username', 'username'];
  let credentialClicked = false;
  let updatedIndex

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


  const dropDownClicked = (index: number) => {
    credentialClicked = !credentialClicked; 
    updatedIndex = isNaN(updatedIndex) ? index : undefined
  }
</script>

<div class="w-full h-full">
  <div class="flex justify-between items-center mb-3 px-4 py-0">
    <h6 class="text-2xl font-medium text-osvauld-highlightwhite tracking-wide">osvauld</h6>
    <div>
      <button class="" on:click={openFullscreenTab}>
        <Maximize />
      </button>
    </div>
  </div>

  <div class="rounded-lg border border-osvauld-iconblack w-full min-h-[15rem] max-h-[33rem] p-3 overflow-hidden">
    {#if passwordFound}
      <div class="text-osvauld-highlightwhite mb-3 flex justify-between items-center text-sm">
          <span class="text-base">
            google.com
          </span>
          <span class="text-osvauld-sheffieldgrey">
            4
          </span>
      </div>
    {/if}
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
   
    {#if !passwordFound}
      <PasswordNotFound/>
    {:else}
      <div class="h-auto p-0">
        <div class="border-b border-osvauld-iconblack w-[calc(100%+1.55rem)] -translate-x-[0.8rem] mb-3"></div>
        <div class="h-[25rem] overflow-y-scroll scrollbar-thin">
        {#each credentials as credential, index}
        <button class="rounded-lg border border-osvauld-iconblack px-4 py-3 font-bold text-osvauld-sheffieldgrey flex flex-col justify-center items-center w-[98%] mb-3 cursor-default" on:click={()=>dropDownClicked(index)}>
             <div class="w-full flex justify-between items-center { updatedIndex === index ? "text-osvauld-quarzowhite mb-2":""}">
                  <span class="text-base font-medium tracking-wide ">{credential}</span>
                  <button class="bg-osvauld-bordergreen px-4 py-1 rounded-[4px] cursor-pointer">
                    {#if credentialClicked && updatedIndex === index}
                      <DownArrow type={'common'} />
                    {:else}
                      <RightArrow />
                    {/if}
                  </button>
            </div>
        {#if credentialClicked && updatedIndex === index}
          <div class="rounded-lg h-[10rem] bg-osvauld-bordergreen p-2 w-full">
            <div class="mb-4">
              <label
                  class="label block mb-2 text-left text-osvauld-dusklabel text-sm font-normal"
                  for={`input-`}>{credential}</label
              >
                  <div class="w-full rounded-lg bg-osvauld-bordergreen border border-osvauld-iconblack text-osvauld-quarzowhite font-normal text-sm flex justify-between items-center px-2 py-1"
                    > 
                          <span>tonyantony300@gmail.com</span>
                          <button class=""><ActiveCopy />
                          </button>
              </div>
           </div>
          </div>
        {/if}
        </button>
        {/each}
      </div>
      </div>
    {/if}
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
