<script lang="ts">
  import browser from "webextension-polyfill";
  import { writable } from 'svelte/store';
  import { selectedCredential } from "../../../store/ui.store";
  import Copy from "../../../../lib/components/basic/copyIcon.svelte";
  import Tick from "../../../../lib/components/basic/tick.svelte";
  
  const copyUsername = writable(false);
  const copyPassword = writable(false);

  async function copyOperation(text: string, isPassword: boolean) {
    try {
      await navigator.clipboard.writeText(text);
      animateCopyFlags(isPassword);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }

  function animateCopyFlags(isPassword: boolean) {
    isPassword ? copyPassword.set(true) : copyUsername.set(true);
    setTimeout(() => {
      isPassword ? copyPassword.set(false) : copyUsername.set(false);
    }, 2000);
  }

  const fillCredentials = async () => {
    console.log("Fiiling signal received");
    const selectedUsername = $selectedCredential && $selectedCredential.username;
    const selectedPassword = $selectedCredential && $selectedCredential.password;
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
    { $selectedCredential && $selectedCredential.username}
    {#if !$copyUsername}
      <button
        class="mx-4 cursor-pointer transition ease-in-out duration-500 transform hover:scale-110"
        on:click={() => {
          $selectedCredential && copyOperation($selectedCredential.username, false);
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
    { $selectedCredential && $selectedCredential.password}
    {#if !$copyPassword}
      <button
        class="mx-4 cursor-pointer transition ease-in-out duration-500 transform hover:scale-110"
        on:click={() => {
         $selectedCredential &&  copyOperation($selectedCredential.password, true);
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
