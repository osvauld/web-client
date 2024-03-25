<script>
  import Loader from "./Loader.svelte";
  import browser from "webextension-polyfill";
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
  class="p-3 w-full h-full bg-osvauld-frameblack text-osvauld-sheffieldgrey font-normal text-xl flex flex-col gap-4 justify-center items-center"
>
  <div>Select Folder to view your credentials...</div>
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
  </div>
</div>
