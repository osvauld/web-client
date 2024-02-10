<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import browser from "webextension-polyfill";
  import { ClosePanel, Add } from "../icons";
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
  import AddLoginFields from "./AddLoginFields.svelte";

  type AddCredentialField = {
    fieldName: string;
    fieldValue: string;
    sensitive: boolean;
  };

  let credentialFields: AddCredentialField[] = [];
  let description = "";
  let name = "";
  let loginSelected = true;
  let folderUsers: User[] = [];
  let addCredentialPaylod: AddCredentialPayload;
  let hoveredIndex = null;
  let credentialType = "Login";
  let loginFields = [
    { fieldName: "Username", fieldValue: "", sensitive: false },
    { fieldName: "Password", fieldValue: "", sensitive: true },
    { fieldName: "URL", fieldValue: "https://", sensitive: false },
  ];

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
        user.publicKey
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

  const credentialTypeSelection = (isLogin: boolean) => {
    loginSelected = isLogin;
    credentialFields = isLogin
      ? loginFields
      : [{ fieldName: "", fieldValue: "", sensitive: false }];
  };

  onMount(async () => {
    credentialFields = loginFields;
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

  /* eslint-disable */
</script>

<div
  class="bg-osvauld-frameblack rounded-3xl border border-osvauld-iconblack"
  in:fly
>
  <div class="flex justify-between items-center px-12 py-6">
    <div>
      <button
        class="text-[1.4rem] font-sans font-normal {loginSelected
          ? 'text-osvauld-quarzowhite border-b-2 border-osvauld-carolinablue'
          : 'text-osvauld-sheffieldgrey '}"
        on:click={() => credentialTypeSelection(true)}
      >
        Add Login credential
      </button>
      <button
        class="text-[1.4rem] font-sans font-normal ml-2 {!loginSelected
          ? 'text-osvauld-quarzowhite border-b-2 border-osvauld-carolinablue'
          : 'text-osvauld-sheffieldgrey '}"
        on:click={() => credentialTypeSelection(false)}
      >
        Add other credential
      </button>
    </div>
    <button class="bg-osvauld-frameblack p-4" on:click={closeDialog}
      ><ClosePanel /></button
    >
  </div>

  <div class="border-b border-osvauld-iconblack w-full"></div>

  <div class="mx-6">
    <input
      class=" w-full h-[3.8rem] my-2 ml-4 bg-osvauld-frameblack border-0 rounded-none text-3xl text-osvauld-quarzowhite font-normal focus:ring-0 focus:ring-offset-0"
      id="name"
      type="text"
      placeholder="Enter Credential name"
      autocomplete="off"
      bind:value={name}
    />

    <div class="min-h-[25vh] max-h-[30vh] overflow-y-scroll scrollbar-thin">
      {#each credentialFields as field, index}
        <AddLoginFields
          {field}
          {index}
          {hoveredIndex}
          on:select={(e) =>
            triggerSensitiveBubble(e.detail.index, e.detail.identifier)}
          on:remove={(e) => removeField(e.detail)}
        />
      {/each}
    </div>
    <div class="flex mr-24">
      <button
        class="py-2 m-4 bg-osvauld-addfieldgrey flex-1 flex justify-center items-center rounded-md text-osvauld-chalkwhite border-2 border-dashed border-osvauld-iconblack"
        on:click={addField}
      >
        <Add color={"#6E7681"} />
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
      class="primary-btn px-[3.25rem] w-1/3 py-2.5 mb-6 mr-3"
      on:click={closeDialog}>Cancel</button
    >
    <button
      class="primary-btn px-[3.25rem] py-2.5 mb-6"
      on:click={saveCredential}>Add credential</button
    >
  </div>
</div>
