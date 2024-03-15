<script>
  import { ActiveCopy, CopyIcon } from "../icons";
  export let fieldName;
  export let fieldValue;
  export let hoverEffect;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fieldValue);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };
</script>

<div class="mb-4 mr-1 max-w-full">
  <label
    class="label block mb-2 text-left text-osvauld-dusklabel text-sm font-normal cursor-pointer"
    for="field">{fieldName}</label
  >
  <div
    class="py-1 px-3 w-full flex justify-between items-center border rounded-lg text-base bg-osvauld-bordergreen border-osvauld-iconblack {hoverEffect
      ? 'text-osvauld-quarzowhite'
      : 'text-osvauld-sheffieldgrey'}"
  >
    <span class="max-w-[90%] overflow-x-hidden">{fieldValue}</span>
    <button on:click={copyToClipboard}>
      {#if hoverEffect}
        <ActiveCopy />
      {:else}
        <CopyIcon />
      {/if}
    </button>
  </div>
</div>
