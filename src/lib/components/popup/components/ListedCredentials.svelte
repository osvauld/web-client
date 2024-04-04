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
  class="rounded-lg border border-osvauld-iconblack px-4 py-3 font-bold text-osvauld-sheffieldgrey flex flex-col justify-center items-center w-[98%] mb-3 cursor-pointer"
  on:click={() => dropDownClicked(index, credential)}
>
  <div
    class="w-full flex justify-between items-center {selectedCredentialIndex ===
    index
      ? 'text-osvauld-quarzowhite mb-2'
      : 'mb-0'}"
  >
    <span class="text-base font-medium tracking-wide">{credential.name}</span>
    <button
      class="bg-osvauld-fieldActive px-4 py-1 rounded-[4px] cursor-pointer"
    >
      {#if credentialClicked && selectedCredentialIndex === index}
        <DownArrow type={"common"} />
      {:else}
        <RightArrow />
      {/if}
    </button>
  </div>
  {#if credentialClicked && selectedCredentialIndex === index}
    <CredentialPopupCard credential={searchedCredential} />
  {/if}
</button>
