<script lang="ts">
  import { secretsStore, selectedSecret } from "../../store/secret.store";
  import SecretDetails from "./SecretDetails.svelte";
  import CopyIcon from "../basic/copyIcon.svelte";
  let showDrawer = false;
  const selectSecret = (secret) => {
    selectedSecret.set(secret);
    showDrawer = true;
  };
</script>

<div class="flex overflow-x-auto">
  <!-- Left Side: List of Cards -->
  <div class="flex flex-wrap p-6 w-full">
    {#each $secretsStore as secret}
      <div class="mb-6 mr-2 flex-none">
        <div
          class="container mx-auto p-4 relative card card-hover rounded-lg group h-auto !bg-[#3A4468]"
          on:click={() => selectSecret(secret)}
        >
          <p class="mb-4">{secret.name}</p>
          <!-- Scrollable area for field names and values, starting after the first two fields -->
          <div class="overflow-y-auto max-h-[260px] min-h-[260px]">
            {#each secret?.unencryptedData as field, index}
              <div class="mb-4">
                <label class="label block mb-2">{field.fieldName}</label>
                <div class="relative">
                  <input
                    class="input pr-10 w-full rounded-2xl items-center !bg-[#3A4468]"
                    type="text"
                    value={field.fieldValue}
                  />
                  <button
                    class="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <CopyIcon />
                  </button>
                </div>
              </div>
            {/each}
          </div>
          <!-- Static description at the bottom -->
          <p class="mb-4">{secret.description}</p>
        </div>
      </div>
    {/each}
  </div>
</div>

{#if $selectedSecret}
  <SecretDetails />
{/if}
