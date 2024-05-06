<script lang="ts">
  import { fly, scale } from "svelte/transition";
  import {
    Locked,
    Eye,
    Unlocked,
    ActiveCopy,
    ClosedEye,
    CopyIcon,
    Tick,
  } from "../icons";
  import { sendMessage } from "../helper";
  export let fieldName;
  export let fieldValue;
  export let hoverEffect;
  export let bgColor;
  let visibility = false;
  let decrypted = false;
  let decryptedValue = "";
  let copied = false;

  const decrypt = async () => {
    const response = await sendMessage("decryptField", fieldValue);
    decryptedValue = response.data;
    decrypted = true;
  };

  const toggleVisibility = () => {
    visibility = !visibility;
    setTimeout(() => {
      visibility = false;
    }, 3000);
  };

  const copyToClipboard = async (e) => {
    copied = true;
    try {
      await navigator.clipboard.writeText(decryptedValue);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
    setTimeout(() => {
      copied = false;
    }, 2000);
  };

  const lockCredential = async () => {
    decrypted = false;
  };
</script>

<div class="mb-2 mr-1 max-w-full" in:fly out:fly>
  <div
    class="label block mb-2 text-left text-osvauld-dusklabel text-xs font-normal cursor-pointer whitespace-nowrap text-ellipsis"
  >
    {fieldName}
  </div>

  <div
    class="py-1 px-3 w-full flex justify-between items-center text-base {hoverEffect
      ? 'text-osvauld-fieldTextActive bg-osvauld-fieldActive rounded-md '
      : 'text-osvauld-fieldText rounded-none border-b border-osvauld-darkLineSeperator'}"
  >
    <span
      class="w-3/5 text-left overflow-x-hidden whitespace-nowrap text-ellipsis font-normal text-sm"
      >{decrypted && visibility ? decryptedValue : "*".repeat(8)}</span
    >
    {#if !decrypted}
      <button on:click|stopPropagation={decrypt}>
        <Locked color={hoverEffect ? "#89B4FA" : "#4D4F60"} />
      </button>
    {:else}
      <div class="w-2/5 flex gap-2 items-center justify-end">
        <button on:click|stopPropagation={lockCredential}>
          <Unlocked />
        </button>
        <button on:click|stopPropagation={toggleVisibility}>
          {#if visibility}
            <ClosedEye />
          {:else}
            <Eye />
          {/if}
        </button>
        <button on:click|stopPropagation={copyToClipboard}>
          {#if copied}
            <span in:scale>
              <Tick />
            </span>
          {:else if hoverEffect}
            <ActiveCopy />
          {:else}
            <CopyIcon color={"#4D4F60"} />
          {/if}
        </button>
      </div>
    {/if}
  </div>
</div>
