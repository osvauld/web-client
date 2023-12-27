<script lang="ts">
  import browser from "webextension-polyfill";
  import { list } from "../../../store/ui.store";
  import { selectedCredential } from "../../../store/ui.store";
  import Copy from "../../../../lib/components/basic/copyIcon.svelte";
  import Tick from "../../../../lib/components/basic/tick.svelte";

  let copiedUsername = false;
  let copiedPassword = false;

  function copyOperation(text: string, boolean: boolean) {
    navigator.clipboard.writeText(text);
    boolean ? (copiedPassword = true) : (copiedUsername = true);
    setTimeout(() => {
      copiedUsername = copiedPassword = false;
    }, 2000);
  }

  const fillCredentials = async () => {
    console.log("Fiiling signal received");
    const selectedUsername = $selectedCredential !== undefined ? $list[$selectedCredential]?.username : undefined;
    const selectedPassword = $selectedCredential !== undefined ? $list[$selectedCredential]?.password : undefined;
    await browser.runtime.sendMessage({
      action: "fillingSignal",
      body:  [selectedUsername, selectedPassword],
    });
  };
</script>

<div
  class="flex flex-col justify-center items-center w-[80%] h-[300px] my-24 mx-auto bg-[#2B324D] border rounded-md border-[#4C598B4D] text-white"
>
  <div class="flex justify-end items-center w-3/4">
    { $selectedCredential && $list[$selectedCredential]?.username}
    {#if !copiedUsername}
      <button
        class="mx-4 cursor-pointer transition ease-in-out duration-500 transform hover:scale-110"
        on:click={() => {
          $selectedCredential && copyOperation($list[$selectedCredential]?.username, false);
        }}
        type="button"
        aria-label="Copy username"
      >
        <Copy />
      </button>
    {:else}
      <span class="mx-4">
        <Tick />
      </span>
    {/if}
  </div>
  <div class="flex justify-end items-center w-3/4">
    {$selectedCredential && $list[$selectedCredential]?.password}
    {#if !copiedPassword}
      <button
        class="mx-4 cursor-pointer transition ease-in-out duration-500 transform hover:scale-110"
        on:click={() => {
         $selectedCredential &&  copyOperation($list[$selectedCredential]?.password, true);
        }}
      >
        <Copy /></button
      >
    {:else}
      <span class="mx-4">
        <Tick />
      </span>
    {/if}
  </div>

  <div class="flex mt-20 justify-center items-center w-3/4 h-[100px]">
    <button
      class="bg-[#4E46DC] py-3 px-12 rounded-3xl cursor-pointer active:scale-95"
      on:click={fillCredentials}>Fill</button
    >
  </div>
</div>
