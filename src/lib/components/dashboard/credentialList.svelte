<script lang="ts">
  import {
    credentialStore,
    selectedCredential,
  } from "../../store/credential.store";
  import { selectedFolder } from "../../store/folder.store";
  import CredentialDetails from "./credentailDetails.svelte";
  import AddCredential from "./AddCredential.svelte";

  import CopyIcon from "../basic/copyIcon.svelte";
  let showDrawer = false;
  let showModal = false;
  const openModal = () => {
    showModal = true;
  };

  const closeModal = () => {
    showModal = false;
  };
  const selectCredential = (credential) => {
    selectedCredential.set(credential);
    showDrawer = true;
  };
</script>

{#if $selectedFolder}
  <button class="bg-blue-900 rounded-full p-2" on:click={openModal}
    >Create Credential</button
  >
{/if}

{#if showModal}
  <div
    class="bg-[#182034] fixed inset-0 flex items-center justify-center z-50"
    on:click={closeModal}
  >
    <div class="p-6 rounded shadow-lg" on:click|stopPropagation>
      <AddCredential on:close={closeModal} />
    </div>
  </div>
{/if}
<div class="flex overflow-x-auto">
  <!-- Left Side: List of Cards -->
  <div class="flex flex-wrap p-6 w-full">
    {#each $credentialStore as credential}
      <div class="mb-6 mr-2 flex-none">
        <div
          class="container mx-auto p-4 relative card card-hover rounded-lg group h-auto !bg-[#3A4468]"
          on:click={() => selectCredential(credential)}
        >
          <p class="mb-4">{credential.name}</p>
          <!-- Scrollable area for field names and values, starting after the first two fields -->
          <div class="overflow-y-auto max-h-[260px] min-h-[260px]">
            {#each credential?.unencryptedData as field, index}
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
          <p class="mb-4">{credential.description}</p>
        </div>
      </div>
    {/each}
  </div>
</div>

{#if $selectedCredential}
  <CredentialDetails />
{/if}
