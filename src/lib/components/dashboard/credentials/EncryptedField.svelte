<script>
  import { fly } from "svelte/transition";
  import browser from "webextension-polyfill";
  import {
    Locked,
    Eye,
    Unlocked,
    ActiveCopy,
    ClosedEye,
    CopyIcon,
  } from "../icons";
  export let fieldName;
  export let fieldValue;
  export let hoverEffect;
  export let bgColor;
  let visibility = false;
  let decrypted = false;
  let decryptedValue = "";

  const decrypt = async () => {
    const response = await browser.runtime.sendMessage({
      action: "decryptField",
      data: fieldValue,
    });
    decryptedValue = response.data;
    decrypted = true;
  };

  const toggleVisibility = () => {
    visibility = !visibility;
    setTimeout(() => {
      visibility = false;
    }, 3000);
  };
</script>

<div class="mb-2 mr-1 max-w-full" in:fly out:fly>
  <div
    class="label block mb-2 text-left text-osvauld-dusklabel text-sm font-normal cursor-pointer"
  >
    {fieldName}
  </div>

  <div
    class="py-1.5 px-3 w-full flex justify-between items-center rounded-lg text-base {bgColor
      ? bgColor
      : 'bg-osvauld-fieldActive '} {hoverEffect
      ? 'text-osvauld-fieldTextActive'
      : 'text-osvauld-fieldText'}"
  >
    <span class="w-3/5 text-left overflow-x-hidden"
      >{decrypted && visibility ? decryptedValue : "*".repeat(8)}</span
    >
    {#if !decrypted}
      <button on:click|stopPropagation={decrypt}>
        <Locked />
      </button>
    {:else}
      <div class="w-2/5 flex gap-2 items-center pr-2">
        <button>
          <Unlocked />
        </button>
        <button on:click|stopPropagation={toggleVisibility}>
          {#if visibility}
            <ClosedEye />
          {:else}
            <Eye />
          {/if}
        </button>
        <button>
          {#if hoverEffect}
            <ActiveCopy />
          {:else}
            <CopyIcon color={null} />
          {/if}
        </button>
      </div>
    {/if}
  </div>
</div>
