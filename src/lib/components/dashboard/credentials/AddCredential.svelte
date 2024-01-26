<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import browser from "webextension-polyfill";
  import { ClosePanel, BinIcon } from "../icons";
  import { encryptCredentialsForUserNew } from "../../../utils/helperMethods";

  import {
    selectedFolder,
    showAddCredentialDrawer,
    credentialStore,
  } from "../store";

  import {
    fetchFolderUsers,
    addCredential,
    fetchCredentialsByFolder,
  } from "../apis";

  import { AddCredentialPayload, Fields, User } from "../dtos";

  type AddCredentialField = {
    fieldName: string;
    fieldValue: string;
    sensitive: boolean;
  };

  let credentialFields: AddCredentialField[] = [];
  let description = "";
  let name = "";
  let folderUsers: User[] = [];
  let addCredentialPaylod: AddCredentialPayload;
  let hoveredIndex = null;
  let credentialType = "Login";

  const addField = () => {
    let newField: AddCredentialField = {
      fieldName: "",
      fieldValue: "",
      sensitive: false,
    };
    credentialFields = [...credentialFields, newField];
  };

  const removeField = (index: number) => {
    credentialFields.splice(index, 1);
    credentialFields = [...credentialFields];
  };

  const saveCredential = async () => {
    if ($selectedFolder === null) throw new Error("folder not selected");
    const addCredentialFields: Fields[] = [];
    for (const field of credentialFields) {
      if (!field.sensitive) {
        addCredentialFields.push({
          fieldName: field.fieldName,
          fieldValue: field.fieldValue,
          fieldType: "meta",
        });
      } else {
        addCredentialFields.push({
          fieldName: field.fieldName,
          fieldValue: field.fieldValue,
          fieldType: "sensitive",
        });
      }
      if (field.fieldName === "URL") {
        const domain = new URL(field.fieldValue).hostname;
        addCredentialFields.push({
          fieldName: "Domain",
          fieldValue: domain,
          fieldType: "additional",
        });
      }
    }
    addCredentialPaylod = {
      name: name,
      description: description,
      folderId: $selectedFolder.id,
      credentialType,
      userFields: [],
    };
    // TODO: validate url if there is url field
    for (const user of folderUsers) {
      const encryptedData = await encryptCredentialsForUserNew(
        [{ fields: addCredentialFields }],
        user.publicKey,
      );
      addCredentialPaylod.userFields.push({
        userId: user.id,
        fields: encryptedData[0].fields,
      });
    }
    await addCredential(addCredentialPaylod);
    if ($selectedFolder === null) throw new Error("folder not selected");
    const responseJson = await fetchCredentialsByFolder($selectedFolder.id);
    const response = await browser.runtime.sendMessage({
      action: "decryptMeta",
      data: responseJson.data,
    });
    credentialStore.set(response.data);
    showAddCredentialDrawer.set(false);
  };

  onMount(async () => {
    credentialFields = [
      { fieldName: "Username", fieldValue: "", sensitive: false },
      { fieldName: "Password", fieldValue: "", sensitive: true },
      { fieldName: "URL", fieldValue: "https://", sensitive: false },
    ];
    if ($selectedFolder === null) throw new Error("folder not selected");
    const responseJson = await fetchFolderUsers($selectedFolder.id);
    folderUsers = responseJson.data;
  });

  function closeDialog() {
    showAddCredentialDrawer.set(false);
  }

  function triggerSensitiveBubble(index: number, isEnter: boolean) {
    isEnter ? (hoveredIndex = index) : (hoveredIndex = null);
  }
</script>

<div
  class="bg-osvauld-frameblack rounded-3xl border border-osvauld-iconblack"
  in:fly
  out:fly
>
  <div class="flex justify-between items-center px-12 py-9">
    <p class="text-[28px] font-sans font-normal text-osvauld-quarzowhite">
      Add Credential
    </p>
    <button class="bg-osvauld-frameblack" on:click={closeDialog}
      ><ClosePanel /></button
    >
  </div>

  <div class="border-b border-osvauld-iconblack w-full"></div>

  <div class="mx-6">
    <input
      class=" w-full h-[60px] my-2 ml-4 bg-osvauld-frameblack border-0 rounded-none text-2xl text-osvauld-quarzowhite font-normal focus:ring-0 focus:ring-offset-0"
      id="name"
      type="text"
      placeholder="Enter Credential name"
      bind:value={name}
    />

    {#each credentialFields as field, index}
      <div class="field-container rounded-sm transition relative">
        <div class="flex items-center justify-between p-4">
          <input
            class="py-1 pr-10 rounded-lg items-center text-base bg-osvauld-frameblack border-osvauld-iconblack w-[256px] h-10 mx-2 focus:border-osvauld-iconblack focus:ring-0"
            id={`key-${index}`}
            type="text"
            placeholder="Username"
            bind:value={field.fieldName}
          />
          <input
            class="py-1 pr-10 rounded-lg items-center text-base bg-osvauld-frameblack border-osvauld-iconblack w-[256px] h-10 mx-2 focus:border-osvauld-iconblack focus:ring-0"
            id={`value-${index}`}
            type="text"
            placeholder="Enter value"
            bind:value={field.fieldValue}
          />
          <div
            class="flex items-center justify-center {index === hoveredIndex
              ? 'relative'
              : ''}"
            on:mouseenter={() => triggerSensitiveBubble(index, true)}
            on:mouseleave={() => triggerSensitiveBubble(index, false)}
          >
            <label
              for={`toggle-${index}`}
              class="inline-flex items-center cursor-pointer"
            >
              <span class="relative">
                <span
                  class="block w-10 h-6 {field.sensitive
                    ? 'bg-osvauld-carolinablue'
                    : 'bg-osvauld-placeholderblack'} rounded-full shadow-inner"
                ></span>
                <span
                  class="absolute block w-4 h-4 mt-1 ml-1 rounded-full shadow inset-y-0 left-0 focus-within:shadow-outline transform transition-transform duration-300 ease-in-out {field.sensitive
                    ? 'bg-osvauld-plainwhite translate-x-full'
                    : 'bg-osvauld-chalkwhite'}"
                >
                  <input
                    type="checkbox"
                    id={`toggle-${index}`}
                    class="absolute opacity-0 w-0 h-0"
                    bind:checked={field.sensitive}
                  />
                </span>
              </span>
            </label>
            {#if index === hoveredIndex}
              <span
                class="absolute top-[-60px] left-[-25px] bg-osvauld-iconblack rounded-lg p-3 text-sm text-osvauld-dusklabel triangle"
                >Sensitive</span
              >
            {/if}
          </div>
          <div class="flex items-center justify-center">
            <button
              class="rounded-md pr-2 pl-2 bg-osvauld-frameblack text-osvauld-quarzowhite flex justify-center items-center ml-5"
              on:click={() => removeField(index)}
            >
              <BinIcon />
            </button>
          </div>
        </div>
      </div>
    {/each}
    <div class="flex mr-24">
      <button
        class="py-2 m-4 bg-macchiato-blue flex-1 flex justify-center items-center rounded-md text-macchiato-surface0"
        on:click={addField}
      >
        Add Field
      </button>
    </div>
  </div>
  <div class=" mx-6 pl-3 flex justify-start items-center mb-5">
    <textarea
      rows="2"
      class="w-5/6 mt-4 h-auto min-h-[6rem] max-h-[10rem] bg-osvauld-frameblack rounded-lg scrollbar-thin border-osvauld-iconblack resize-none text-base focus:border-osvauld-iconblack focus:ring-0"
      bind:value={description}
      placeholder="Enter description about the secret"
    />
  </div>
  <div class="border-b border-osvauld-iconblack w-full my-2"></div>
  <div class="flex justify-end items-center mx-10 py-2">
    <button
      class="text-osvauld-sheffieldgrey border border-osvauld-iconblack px-[52px] w-1/3 py-2.5 rounded-lg mb-6 bg-osvauld-placeholderblack mr-3"
      on:click={closeDialog}>Cancel</button
    >

    <button
      class="bg-macchiato-blue px-[52px] py-2.5 rounded-lg mb-6 text-macchiato-surface0"
      on:click={saveCredential}>Add credential</button
    >
  </div>
</div>

<style>
  .triangle::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    border-width: 10px;
    border-style: solid;
    border-color: transparent transparent #21262d transparent;
    transform: translateX(-50%) rotate(180deg);
  }
</style>
