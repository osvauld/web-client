<script>
  import { ActiveCopy, CopyIcon } from "../icons";
  export let fieldName;
  export let fieldValue;
  export let hoverEffect;
  export let bgColor;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fieldValue);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };
</script>

<div class="mb-2 mr-1 max-w-full">
  <label
    class="label block mb-2 text-left text-osvauld-dusklabel text-sm font-normal cursor-pointer"
    for="field">{fieldName}</label
  >
  <div
    class="py-1.5 px-3 w-full flex justify-between items-center rounded-lg text-base {bgColor
      ? bgColor
      : 'bg-osvauld-fieldActive '}{hoverEffect
      ? 'text-osvauld-fieldTextActive'
      : 'text-osvauld-fieldText'}"
  >
    <span class="w-full text-left overflow-x-hidden">{fieldValue}</span>
    <button on:click={copyToClipboard}>
      {#if hoverEffect}
        <ActiveCopy />
      {:else}
        <CopyIcon color={null} />
      {/if}
    </button>
  </div>
</div>
