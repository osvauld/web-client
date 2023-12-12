<script lang="ts">
  import { fetchFolderUsers } from "../../apis/folder.api";
  import { selectedFolder } from "../../store/folder.store";
  import { showAddCredentialDrawer } from "../../store/ui.store";
  import { onMount } from "svelte";
  import { importPublicKey, encryptWithPublicKey } from "../../utils/crypto";
  import { addCredential } from "../../apis/credentials.api";
  import { fetchCredentailsByFolder } from "../../apis/credentials.api";

  let credentialFields = [];
  let description = "";
  let name = "";
  const addField = () => {
    let newField = { fieldName: "", fieldValue: "", sensitive: false };
    credentialFields = [...credentialFields, newField];
  };

  const removeField = (index) => {
    credentialFields.splice(index, 1);
    credentialFields = [...credentialFields];
  };
  const saveCredential = async () => {
    const unencryptedFields = [];
    const toEncryptFields = [];
    for (const field of credentialFields) {
      if (!field.sensitive) {
        unencryptedFields.push(field);
      } else {
        toEncryptFields.push(field);
      }
    }

    let encryptedFields = [];
    for (const user of folderUsers) {
      let userPayload = {
        userId: user.id,
        fields: [],
      };
      const publicKey = await importPublicKey(user.publicKey);
      for (const toEncryptField of toEncryptFields) {
        const encryptedFieldValue = await encryptWithPublicKey(
          toEncryptField.fieldValue,
          publicKey
        );
        userPayload.fields.push({
          fieldName: toEncryptField.fieldName,
          fieldValue: encryptedFieldValue,
        });
      }
      encryptedFields.push(userPayload);
    }

    const payload = {
      name: name,
      description: description,
      folderId: $selectedFolder.id,
      unencryptedFields: unencryptedFields,
      encryptedFields: encryptedFields,
    };
    await addCredential(payload);
    fetchCredentailsByFolder($selectedFolder.id);
    showAddCredentialDrawer.set(false);
  };

  let folderUsers = [];
  onMount(async () => {
    credentialFields = [
      { fieldName: "Username", fieldValue: "asdf", sensitive: false },
      { fieldName: "Password", fieldValue: "sadf", sensitive: true },
      { fieldName: "URL", fieldValue: "asdf", sensitive: false },
    ];
    const responseJson = await fetchFolderUsers($selectedFolder.id);
    folderUsers = responseJson.data;
  });
</script>

<div class="mb-2 p-4 mx-6 mt-6">
  <p class="font-normal text-4xl">Add Credential</p>
</div>
<div class="mx-6">
  <input
    class="flex-grow bg-[#2E3654] rounded-full w-[256px] h-10 ml-4"
    id="name"
    type="text"
    placeholder="name"
    bind:value={name}
  />
  {#each credentialFields as field, index}
    <div class="field-container rounded-sm transition relative">
      <div class="flex items-center justify-between p-4">
        <input
          class="flex-grow mr-2 bg-[#2E3654] rounded-full w-[256px] h-10"
          id={`key-${index}`}
          type="text"
          placeholder="Username"
          bind:value={field.fieldName}
        />
        <input
          class="flex-grow mr-2 bg-[#2E3654] rounded-full w-[256px] h-10"
          id={`value-${index}`}
          type="text"
          placeholder="Enter value"
          bind:value={field.fieldValue}
        />
        <div class="flex items-center justify-center">
          <input
            type="checkbox"
            id={`sensitive-${index}`}
            bind:checked={field.sensitive}
          />
          <label class="ml-2" for={`sensitive-${index}`}> Sensitive </label>
        </div>
      </div>
      <button
        class="rounded-full border border-[#4C598B] w-10 h-10 flex justify-center items-center ml-5"
        on:click={() => removeField(index)}
      >
        delete
      </button>
    </div>
  {/each}
  <!-- Add secret btn -->
  <div class="flex mr-24">
    <button
      class="py-2 m-4 bg-[#363F61] flex-1 flex justify-center items-center rounded-lg border-dashed border border-[#3D476E]"
      on:click={addField}
    >
      addField
    </button>
  </div>
</div>
<!-- Text Area -->
<div class="mx-6 px-4 py-5 mr-[120px]">
  <textarea
    id="textarea"
    class="textarea"
    rows="2"
    bind:value={description}
    placeholder="Enter description about the secret"
  />
</div>
<div class="flex justify-start mt-4 pl-4 ml-6">
  <button
    class="bg-[#4E46DC] px-[52px] py-2.5 rounded-full mb-6"
    on:click={saveCredential}>Add credential</button
  >
</div>

<style>
  #textarea {
    background: #2e3654;
  }
</style>
