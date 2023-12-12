<script>
  import { onDestroy, onMount } from "svelte";
  import { selectedCredential } from "../../store/credential.store";
  import { fetchCredentialById } from "../../apis/credentials.api";
  import { pvtKey } from "../../apis/temp";
  import { decryptCredentialFields } from "../../utils/crypto";
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
      ...credentialDetails.data.credential,
      encryptedData: credentialDetails.data.encryptedData,
      unencryptedData: credentialDetails.data.unencryptedData,
    };
    users = credentialDetails.data.users;
    isLoading = false;
  };
  const unsubscribe = selectedCredential.subscribe(async (value) => {
    if (value === null) return;
    await updateCredentailDetails();
  });

  const decryptCredential = async () => {
    const encryptedData = [...credentialDetailsJSON.encryptedData];
    console.log("BEFORE", encryptedData);
    const decryptedFields = await decryptCredentialFields(
      encryptedData,
      pvtKey
    );
    console.log("AFTER", decryptedFields);
    credentialDetailsJSON = {
      ...credentialDetailsJSON,
      encryptedData: decryptedFields,
    };
    console.log(credentialDetailsJSON);
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
    class=" w-64 h-full shadow-xl transition-transform transform translate-x-0"
  >
    <button class="p-2" on:click={close}>Close</button>
    <div
      class="container mx-auto p-4 card rounded-lg h-auto w-full bg-[#2E3654]"
    >
      {#if !isLoading}
        <p class="mb-4">{credentialDetailsJSON?.name}</p>
        {#each credentialDetailsJSON?.unencryptedData as field, index}
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
        {#if credentialDetailsJSON?.encryptedData}
          {#each credentialDetailsJSON.encryptedData as field, index}
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
        <p class="mb-4">{credentialDetailsJSON.description}</p>
        <div><h2>Access List</h2></div>
        {#each users as user}
          <div
            class="border rounded-md border-transparent hover:border-blue-900 py-2"
          >
            {user.name}
          </div>
        {/each}
      {/if}
    </div>
    <button on:click={decryptCredential}>DECRYPT</button>
  </div>
</div>
