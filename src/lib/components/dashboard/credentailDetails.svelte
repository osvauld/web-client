<script>
  import { onMount } from "svelte";
  import {
    credentialStore,
    selectedCredential,
  } from "../../store/credential.store";
  import { fetchCredentialById } from "../../apis/credentials.api";
  import CopyIcon from "../basic/copyIcon.svelte";
  import { get } from "svelte/store";
  export function close() {
    selectedCredential.set(null);
  }
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      console.log("Text copied to clipboard");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }
  let users = [];
  onMount(async () => {
    const credentialDetails = await fetchCredentialById($selectedCredential.id);
    selectedCredential.set({
      ...credentialDetails.data.credential,
      encryptedData: credentialDetails.data.encryptedData,
      unencryptedData: credentialDetails.data.unencryptedData,
    });

    users = credentialDetails.data.users;
  });
</script>

<div class="fixed bg-gray-600 top-0 right-0 z-50 flex justify-end rounded-xl">
  <div
    class=" w-64 h-full shadow-xl transition-transform transform translate-x-0"
  >
    <!-- Content for your overlay -->

    <button class="p-2" on:click={close}>Close</button>
    <div
      class="container mx-auto p-4 card rounded-lg h-auto w-full bg-[#2E3654]"
    >
      <p class="mb-4">{$selectedCredential?.name}</p>
      {#each $selectedCredential?.unencryptedData as field, index}
        <div class="relative mb-4">
          <label class="label block mb-2">{field.fieldName}</label>
          <input
            class="input pr-10 w-full items-center bg-[#2E3654]"
            value={field.fieldValue}
          />
          <button
            class="right-2 absolute top-[calc(50%+10px)]"
            on:click={copyToClipboard(field.fieldValue)}
          >
            <CopyIcon />
          </button>
        </div>
      {/each}
      {#if $selectedCredential?.encryptedData}
        {#each $selectedCredential.encryptedData as field, index}
          <div class="relative mb-4">
            <label class="label block mb-2">{field.fieldName}</label>
            <input
              class="input pr-10 w-full items-center bg-[#2E3654]"
              value={field.fieldValue}
            />
            <button
              class="right-2 absolute top-[calc(50%+10px)]"
              on:click={copyToClipboard(field.fieldValue)}
            >
              <CopyIcon />
            </button>
          </div>
        {/each}
      {/if}
      <p class="mb-4">{$selectedCredential.description}</p>
      <div><h2>Access List</h2></div>
      {#each users as user}
        <div
          class="border rounded-md border-transparent hover:border-blue-900 py-2"
        >
          {user.name}
        </div>
      {/each}
    </div>
  </div>
</div>
