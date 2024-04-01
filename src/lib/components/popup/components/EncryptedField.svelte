<script lang="ts">
  import { Locked, Eye, Unlocked, ActiveCopy, ClosedEye } from "../icons";
  import { sendMessage } from "../../dashboard/helper";
  export let fieldName;
  export let fieldValue;
  let visibility = false;
  let decrypted = false;
  let decryptedValue = "";

  const decrypt = async () => {
    const response = await sendMessage("decryptField", fieldValue);
    decryptedValue = response.data;
    decrypted = true;
  };

  const toggleVisibility = () => {
    visibility = !visibility;
  };

  const copyToClipboard = () => {
    if (decrypted) {
      navigator.clipboard.writeText(decryptedValue);
    }
  };
</script>

<div class="mb-2">
  <div
    class="label block mb-1 text-left bg-osvauld-frameblack text-osvauld-dusklabel text-xs font-normal"
  >
    {fieldName}
  </div>
  <div
    class="w-full rounded-lg bg-osvauld-fieldActive text-osvauld-textActive font-normal text-sm flex justify-between items-center px-2 py-0"
  >
    <div
      class=" border-0 rounded-lg py-1 w-2/3 flex justify-start items-center"
    >
      {decrypted && visibility ? decryptedValue : "*".repeat(8)}
    </div>
    {#if !decrypted}
      <button on:click|stopPropagation={decrypt} class="scale-[0.8]">
        <Locked />
      </button>
    {:else}
      <div class="w-1/3 flex justify-between items-center scale-[0.8]">
        <button
          on:click|stopPropagation={() => {
            visibility = false;
          }}
        >
          <Unlocked />
        </button>
        <button on:click|stopPropagation={toggleVisibility}>
          {#if visibility}
            <ClosedEye />
          {:else}
            <Eye />
          {/if}
        </button>
        <button
          on:click|stopPropagation={copyToClipboard}
          class="active:scale-90"
        >
          <ActiveCopy />
        </button>
      </div>
    {/if}
  </div>
</div>
