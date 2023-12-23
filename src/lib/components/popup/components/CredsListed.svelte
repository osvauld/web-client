<script lang="ts">
  import Key from "../../../components/basic/key.svelte";
  import RightArrow from "../../../components/basic/rightArrow.svelte";
  import { list } from "../../../store/ui.store";
  import { selectedCredential } from "../../../store/ui.store";
  import { credOpen } from "../../../store/ui.store";
  import browser from "webextension-polyfill";
  import { onMount } from "svelte";
  let url = "https://devs.osvuald.com";

  // Need the code to fetch the Url from the background script and display it here.

  function credentialClicked(index: any) {
    selectedCredential.set(index);
    credOpen.set(true);
  }

  onMount(async () => {
    console.log("on mount");
    browser.runtime
      .sendMessage({ eventName: "decrypt", data: "sdfd" })
      .then((response) => {
        // Handle the response here
        console.log(response);
      })
      .catch((error) => console.error(error));
  });
</script>

<div class="text-white flex justify-center items-center flex-col">
  <input
    class="flex justify-center items-center w-[80%] bg-[#2B324D] border rounded-md border-[#4C598B4D] py-1 my-2 text-sm focus:border-[#4C598B4D] focus:ring-0"
    value={url}
  />
  <!-- List urls -->
  <div class="w-[80%] pt-8 max-h-[420px] overflow-y-scroll">
    {#if $list.length > 0}
      {#each $list as item, index (item.username)}
        <button
          class="w-full h-[50px] border rounded-md border-[#4C598B4D] flex justify-between items-center px-5 my-1 cursor-pointer active:bg-[#353E60] active:scale-[0.98]"
          on:click={() => index && credentialClicked(index) }
        >
          <Key />
          <span>{item.username}</span>
          <RightArrow />
        </button>
      {/each}
    {:else}
      <div class="flex justify-center items-center">No Credentials Found</div>
    {/if}
  </div>
</div>
