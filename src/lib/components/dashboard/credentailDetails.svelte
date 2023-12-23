<script>
  import { onDestroy, onMount } from "svelte";
  import { selectedCredential } from "../../store/credential.store";
  import { fetchCredentialById } from "../../apis/credentials.api";
  import browser from "webextension-polyfill";
  import CopyIcon from "../basic/copyIcon.svelte";
  let isLoading = true;
  // TODO: render selected credential when is loading true
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
  let credentialDetailsJSON = {};
  const updateCredentailDetails = async () => {
    isLoading = true;
    const credentialDetails = await fetchCredentialById($selectedCredential.id);
    credentialDetailsJSON = {
      ...credentialDetails.data,
    };
    console.log(credentialDetailsJSON);
    // users = credentialDetails.data.users;
    isLoading = false;
  };
  const unsubscribe = selectedCredential.subscribe(async (value) => {
    if (value === null) return;
    await updateCredentailDetails();
  });

  const decryptCredential = async () => {
    const encryptedData = [...credentialDetailsJSON.encryptedFields];
    const response = await browser.runtime.sendMessage({
      eventName: "decrypt",
      data: encryptedData,
    });

    credentialDetailsJSON = {
      ...credentialDetailsJSON,
      encryptedFields: response.data,
    };
    console.log(credentialDetailsJSON);
    isLoading = false;
  };

  onMount(async () => {
    await updateCredentailDetails();
  });
  onDestroy(() => {
    unsubscribe();
  });
</script>

<div class="fixed bg-gray-600 top-0 right-0 z-50 flex justify-end rounded-xl">
  <div
    class=" w-64 h-full shadow-xl transition-transform transform translate-x-0 bg-macchiato-surface1"
  >
    <button class="p-2" on:click={close}>Close</button>
    <div class="container mx-auto p-4 card rounded-lg h-auto w-full">
      {#if !isLoading}
        <p class="mb-4">{credentialDetailsJSON?.name}</p>
        {#each credentialDetailsJSON?.unencryptedFields as field, index}
          <div class="relative mb-4">
            <label class="label block mb-2" for={`input-${index}`}
              >{field.fieldName}</label
            >
            <input
              class="input pr-10 w-full items-center bg-macchiato-surface2"
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
        {#if credentialDetailsJSON?.encryptedFields}
          {#each credentialDetailsJSON.encryptedFields as field, index}
            <div class="relative mb-4">
              <label class="label block mb-2" for={`input-${index}`}
                >{field.fieldName}</label
              >
              <input
                class="input pr-10 w-full items-center bg-macchiato-surface2"
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
        <textarea
          class="mt-4 w-full h-auto min-h-[4rem] max-h-[20rem] bg-macchiato-overlay0 rounded-md scrollbar-thin"
        >
          {credentialDetailsJSON.description}
        </textarea>
      {/if}
    </div>
    <div class="flex justify-center">
      <button
        on:click={decryptCredential}
        class="p-2 bg-macchiato-red rounded-md text-macchiato-surface0"
        >DECRYPT</button
      >
    </div>
  </div>
</div>
