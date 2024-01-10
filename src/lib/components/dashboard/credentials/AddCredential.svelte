<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";

  import {
    importRSAPublicKey,
    encryptWithPublicKey,
  } from "../../../utils/crypto";

  import { selectedFolder, showAddCredentialDrawer } from "../store";

  import {
    fetchFolderUsers,
    addCredential,
    fetchCredentailsByFolder,
  } from "../apis";

  import {
    AddCredentialFieldPayload,
    AddCredentialPayload,
    UserAccessPayload,
    CredentialFields,
    User,
  } from "../dtos";

  let credentialFields: AddCredentialFieldPayload[] = [];
  let description = "";
  let name = "";
  let folderUsers: User[] = [];
  let userAccessPayload: UserAccessPayload[] = [];
  let addCredentialPaylod: AddCredentialPayload;

  const addField = () => {
    let newField = { fieldName: "", fieldValue: "", sensitive: false };
    credentialFields = [...credentialFields, newField];
  };

  const removeField = (index: number) => {
    credentialFields.splice(index, 1);
    credentialFields = [...credentialFields];
  };

  const saveCredential = async () => {
    if ($selectedFolder === null) throw new Error("folder not selected");
    const unencryptedFields: CredentialFields[] = [];
    const toEncryptFields: CredentialFields[] = [];
    for (const field of credentialFields) {
      if (!field.sensitive) {
        unencryptedFields.push(field);
      } else {
        toEncryptFields.push(field);
      }
    }
    addCredentialPaylod = {
      name: name,
      description: description,
      folderId: $selectedFolder.id,
      unencryptedFields: unencryptedFields,
      userAccessDetails: [],
    };
    for (const user of folderUsers) {
      let userPayload: UserAccessPayload = {
        userId: user.id,
        encryptedFields: [],
      };
      console.log(user.publicKey);
      const publicKey = await importRSAPublicKey(user.publicKey);
      for (const toEncryptField of toEncryptFields) {
        const encryptedFieldValue = await encryptWithPublicKey(
          toEncryptField.fieldValue,
          publicKey,
        );
        userPayload.encryptedFields.push({
          fieldName: toEncryptField.fieldName,
          fieldValue: encryptedFieldValue,
        });
      }
      userAccessPayload.push(userPayload);
    }
    addCredentialPaylod.userAccessDetails = userAccessPayload;
    await addCredential(addCredentialPaylod);
    if ($selectedFolder === null) throw new Error("folder not selected");
    await fetchCredentailsByFolder($selectedFolder.id);
    showAddCredentialDrawer.set(false);
  };

  onMount(async () => {
    credentialFields = [
      { fieldName: "Username", fieldValue: "", sensitive: false },
      { fieldName: "Password", fieldValue: "", sensitive: true },
      { fieldName: "URL", fieldValue: "", sensitive: false },
    ];
    if ($selectedFolder === null) throw new Error("folder not selected");
    folderUsers = await fetchFolderUsers($selectedFolder.id);
  });
</script>

<div class="bg-macchiato-base rounded-md" in:fly out:fly>
  <div class="mb-2 p-4 mx-6 mt-6">
    <p class="font-normal text-4xl">Add Credential</p>
  </div>
  <div class="mx-6">
    <input
      class="flex-grow bg-macchiato-surface0 rounded-full w-[256px] h-10 ml-4"
      id="name"
      type="text"
      placeholder="name"
      bind:value={name}
    />
    {#each credentialFields as field, index}
      <div class="field-container rounded-sm transition relative">
        <div class="flex items-center justify-between p-4">
          <input
            class="flex-grow mr-2 bg-macchiato-surface0 rounded-full w-[256px] h-10"
            id={`key-${index}`}
            type="text"
            placeholder="Username"
            bind:value={field.fieldName}
          />
          <input
            class="flex-grow mr-2 bg-macchiato-surface0 rounded-full w-[256px] h-10"
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
          class="rounded-md pr-2 pl-2 bg-macchiato-lavender text-macchiato-surface0 flex justify-center items-center ml-5"
          on:click={() => removeField(index)}
        >
          delete
        </button>
      </div>
    {/each}
    <!-- Add secret btn -->
    <div class="flex mr-24">
      <button
        class="py-2 m-4 bg-macchiato-blue flex-1 flex justify-center items-center rounded-md text-macchiato-surface0"
        on:click={addField}
      >
        addField
      </button>
    </div>
  </div>
  <!-- Text Area -->
  <div>
    <textarea
      rows="2"
      class="bg-macchiato-surface0 w-full rounded-md ml-4 mr-4"
      bind:value={description}
      placeholder="Enter description about the secret"
    />
  </div>
  <div class="flex justify-start mt-4 pl-4 ml-6">
    <button
      class="bg-macchiato-blue px-[52px] py-2.5 rounded-full mb-6 text-macchiato-surface0"
      on:click={saveCredential}>Add credential</button
    >
  </div>
</div>
