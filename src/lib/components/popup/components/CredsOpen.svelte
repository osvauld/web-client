<script>
  import browser from "webextension-polyfill";
  import { list } from "../../../store/ui.store";
  import { selectedCredential } from "../../../store/ui.store";
  import Copy from "../../../../lib/components/basic/copyIcon.svelte";
  import Tick from "../../../../lib/components/basic/tick.svelte";

  let copiedUsername = false;
  let copiedPassword = false;

  function copyOperation(text, boolean) {
    navigator.clipboard.writeText(text);
    boolean ? (copiedPassword = true) : (copiedUsername = true);
    setTimeout(() => {
      copiedUsername = copiedPassword = false;
    }, 2000);
  }

  const fillCredentials =  async () => {
    console.log('Fiiling signal received');
    await browser.runtime.sendMessage({ action: "fillingSignal", body:[$list[$selectedCredential]?.username, $list[$selectedCredential]?.password] });
  }

</script>

<div
  class="flex flex-col justify-center items-center w-[80%] h-[300px] my-24 mx-auto bg-[#2B324D] border rounded-md border-[#4C598B4D] text-white"
>
  <div class="flex justify-end items-center w-3/4">
    {$list[$selectedCredential]?.username}
    {#if !copiedUsername}
      <span
        class="mx-4 cursor-pointer transition ease-in-out duration-500 transform hover:scale-110"
        on:click={() => {
          copyOperation($list[$selectedCredential]?.username, false);
        }}
      >
        <Copy /></span
      >
    {:else}
      <span class="mx-4">
        <Tick />
      </span>
    {/if}
  </div>
  <div class="flex justify-end items-center w-3/4">
    {$list[$selectedCredential]?.password}
    {#if !copiedPassword}
      <span
        class="mx-4 cursor-pointer transition ease-in-out duration-500 transform hover:scale-110"
        on:click={() => {
          copyOperation($list[$selectedCredential]?.password, true);
        }}
      >
        <Copy /></span
      >
    {:else}
      <span class="mx-4">
        <Tick />
      </span>
    {/if}
  </div >

  <div class="flex mt-20 justify-center items-center w-3/4 h-[100px]">
    <button class="bg-[#4E46DC] py-3 px-12 rounded-3xl cursor-pointer active:scale-95" on:click={fillCredentials}>Fill</button>
  </div>
</div>
