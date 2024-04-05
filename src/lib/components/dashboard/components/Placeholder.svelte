<script lang="ts">
  import browser from "webextension-polyfill";
  import Loader from "./Loader.svelte";
  import { getTokenAndBaseUrl } from "../helper";
  import CopyIcon from "../../basic/icons/copyIcon.svelte";
  let copiedToClipboard = false;
  let isLoaderActive = false;

  const exportManager = async () => {
    isLoaderActive = true;
    const { baseUrl } = await getTokenAndBaseUrl();
    const encryptionPvtKeyObj =
      await browser.storage.local.get("encryptionPvtKey");
    const signPvtKeyObj = await browser.storage.local.get("signPvtKey");
    const encryptionKey = encryptionPvtKeyObj.encryptionPvtKey;
    const signKey = signPvtKeyObj.signPvtKey;
    const exporter = JSON.stringify({ encryptionKey, signKey, baseUrl });
    await navigator.clipboard.writeText(exporter);
    copiedToClipboard = true;
    isLoaderActive = false;
  };
</script>

<div
  class="px-[11.30rem] py-[3.25rem] w-full h-[40rem] bg-osvauld-frameblack text-osvauld-sheffieldgrey font-normal text-xl flex flex-col gap-4 justify-center items-center"
>
  <div class="font-Jakarta text-6xl text-osvauld-textActive">
    <h1 class="font-Jakarta text-6xl">Welcome, Tony Antony</h1>
    <p class="font-sans text-base font-light mt-4">
      Lets Jump right onto things!
    </p>
  </div>
  <div class="flex justify-around items-center gap-10 w-full h-[370px]">
    <div
      class="bg-osvauld-cardshade h-[80%] w-[45%] rounded-2xl flex flex-col gap-7 justify-center items-start p-10"
    >
      <h2 class="text-3xl">Organize your credentials</h2>
      <p class="text-base">
        Create a new folder to securely store your credentials. Stay organized
        and access them easily whenever you need.
      </p>
      <button
        class="text-base border border-osvauld-iconblack rounded-md px-4 py-1"
        >Create new folder</button
      >
    </div>
    <div
      class="bg-osvauld-cardshade h-[80%] w-[45%] rounded-2xl flex flex-col justify-center gap-7 items-start p-10"
    >
      <h2 class="text-3xl">Collaborate with teams</h2>
      <p class="text-base">
        Start a new group to collaborate, share your credentials, manage access,
        and streamline your workflows.
      </p>
      <button
        class="text-base border border-osvauld-iconblack rounded-md px-4 py-1"
        >Start new group</button
      >
    </div>
  </div>
  <!-- <div>Select Folder to view your credentials...</div>
  <div class="mt-60">
    <button
      class="rounded-lg bg-osvauld-managerPurple text-osvauld-managerText px-10 py-4 cursor-pointer active:scale-95 flex justify-center items-center"
      on:click={exportManager}
    >
      {#if isLoaderActive}
        <Loader />
      {:else if copiedToClipboard}
        <span> Copied to clipboard, Proceed with caution! </span>
      {:else}
        <CopyIcon color={"#F5C2E7"} />
        <span class="ml-2"> Copy Recovery Data </span>
      {/if}
    </button>
  </div> -->
</div>
