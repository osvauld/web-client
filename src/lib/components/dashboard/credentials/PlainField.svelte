<script lang="ts">
  import { ActiveCopy, CopyIcon } from "../icons";
  export let fieldName;
  export let fieldValue;
  export let hoverEffect;
  export let bgColor;

  const copyToClipboard = async (e) => {
    try {
      await navigator.clipboard.writeText(fieldValue);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };
</script>

<div class="mb-2.5 mr-1 max-w-full">
  <label
    class="label block mb-1 text-left text-osvauld-dusklabel text-xs font-normal cursor-pointer"
    for="field">{fieldName}</label
  >
  <div
    class="py-1 px-3 w-full flex justify-between items-center text-base {hoverEffect
      ? 'text-osvauld-fieldTextActive bg-osvauld-fieldActive rounded-md'
      : 'text-osvauld-fieldText rounded-none border-b border-osvauld-darkLineSeperator'}"
  >
    <span class="w-full text-left overflow-x-hidden font-normal text-sm"
      >{fieldValue}</span
    >
    <button on:click|preventDefault|stopPropagation={copyToClipboard}>
      {#if hoverEffect}
        <ActiveCopy />
      {:else}
        <CopyIcon color={"#4D4F60"} />
      {/if}
    </button>
  </div>
</div>
