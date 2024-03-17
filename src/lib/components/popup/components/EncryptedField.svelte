<script>
  import browser from "webextension-polyfill";
  import { Locked, Eye, Unlocked, ActiveCopy, ClosedEye } from "../icons";
  export let fieldName;
  export let fieldValue;
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

  const copyToClipboard = () => {
    if (decrypted) {
      navigator.clipboard.writeText(decryptedValue);
    }
  };
</script>

<div class="mb-2">
  <div
    class="label block mb-1 text-left text-osvauld-dusklabel text-xs font-normal"
  >
    {fieldName}
  </div>
  <div
    class="w-full rounded-lg bg-osvauld-bordergreen border border-osvauld-iconblack text-osvauld-quarzowhite font-normal text-sm flex justify-between items-center px-2 py-0"
  >
    <div
      class="text-osvauld-sheffieldgrey border-0 rounded-lg py-1 w-2/3 text-left"
    >
      {decrypted && visibility ? decryptedValue : "*".repeat(8)}
    </div>
    {#if !decrypted}
      <button on:click|stopPropagation={decrypt}>
        <Locked />
      </button>
    {:else}
      <div class="flex justify-center items-center">
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
        <button on:click|stopPropagation={copyToClipboard}>
          <ActiveCopy />
        </button>
      </div>
    {/if}
  </div>
</div>
