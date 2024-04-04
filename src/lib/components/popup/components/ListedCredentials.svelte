<script>
  import CredentialPopupCard from "../../dashboard/components/CredentialPopupCard.svelte";
  import { RightArrow, DownArrow } from "../icons";
  export let credential;
  export let index;
  export let selectedCredentialIndex;
  export let credentialClicked;
  export let searchedCredential;
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  const dropDownClicked = (index, credential) => {
    dispatch("select", { index, credential });
  };
</script>

<button
  class="rounded-2xl hover:border border-osvauld-iconblack hover:!text-osvauld-fieldTextActive bg-osvauld-cardshade px-1 py-2 font-bold text-osvauld-sheffieldgrey flex flex-col justify-center items-center w-full mb-3 cursor-pointer {selectedCredentialIndex ===
  index
    ? 'border border-osvauld-iconblack'
    : ''}"
  on:click={() => dropDownClicked(index, credential)}
>
  <div
    class="w-full flex justify-between items-center px-4 {selectedCredentialIndex ===
    index
      ? 'text-osvauld-quarzowhite mb-2'
      : 'mb-0'}"
  >
    <span class="text-base font-normal tracking-wide">{credential.name}</span>
    <button class="px-4 py-1 cursor-pointer">
      {#if credentialClicked && selectedCredentialIndex === index}
        <DownArrow type={"common"} />
      {:else}
        <RightArrow />
      {/if}
    </button>
  </div>
  {#if credentialClicked && selectedCredentialIndex === index}
    <div class="border-b border-osvauld-iconblack w-full mb-3"></div>
    <CredentialPopupCard credential={searchedCredential} />
  {/if}
</button>
