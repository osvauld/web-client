<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { ClosePanel, Add, BinIcon } from "../icons";
  import Loader from "../components/Loader.svelte";

  import {
    selectedFolder,
    showCredentialEditor,
    credentialStore,
    showEditCredentialDialog,
    credentialIdForEdit,
  } from "../store";

  import {
    fetchFolderUsersForDataSync,
    addCredential,
    updateCredential,
    fetchCredentialsByFolder,
    fetchSensitiveFieldsByCredentialId,
    fetchCredentialUsersForDataSync,
  } from "../apis";

  import {
    AddCredentialPayload,
    Fields,
    User,
    AddCredentialField,
    CredentialFieldWithId,
  } from "../dtos";
  import AddLoginFields from "./AddLoginFields.svelte";
  import { sendMessage } from "../helper";

  let credentialFields: AddCredentialField[] | CredentialFieldWithId[] = [];
  let description = "";
  let name = "";
  let notNamed = false;
  let isLoaderActive: boolean = false;
  let loginSelected = true;
  let usersToShare: User[] = [];
  let addCredentialPaylod: AddCredentialPayload;
  let hoveredIndex: Number | null = null;
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
  //TODO: change user type
  const removeField = (index: number) => {
    credentialFields.splice(index, 1);
    credentialFields = [...credentialFields];
  };

  const FetchSensitiveFieldsAndDecrypt = async (credentialId: string) => {
    let sensitiveFieldsForEdit = [];
    const response = await fetchSensitiveFieldsByCredentialId(credentialId);
    let sensitiveFields = response.data;
    for (let field of sensitiveFields) {
      const response = await sendMessage("decryptField", field.fieldValue);
      let decryptedValue = response.data;
      sensitiveFieldsForEdit.push({
        fieldName: field.fieldName,
        fieldValue: decryptedValue,
        sensitive: true,
      });
    }
    return sensitiveFieldsForEdit;
  };

  const saveCredential = async () => {
    isLoaderActive = true;
    if ($selectedFolder === null) throw new Error("folder not selected");
    if (name.length === 0) {
      isLoaderActive = false;
      notNamed = true;
      setTimeout(() => {
        notNamed = false;
      }, 1000);
      throw new Error("no name given");
    }
    let domain = "";
    let addCredentialFields: Fields[] = [];
    for (const field of credentialFields) {
      if (field.fieldName === "URL" && !$showEditCredentialDialog) {
        domain = new URL(field.fieldValue).hostname;
        addCredentialFields.push({
          fieldName: "Domain",
          fieldValue: domain,
          fieldType: "additional",
        });
      }
      if (field.fieldName.length !== 0 || field.fieldValue.length !== 0) {
        const baseField: Fields = {
          fieldName: field.fieldName,
          fieldValue: field.fieldValue,
          fieldType: field.sensitive ? "sensitive" : "meta",
        };
        addCredentialFields.push(baseField);
      }
    }

    addCredentialPaylod = {
      name: name,
      description: description,
      folderId: $selectedFolder.id,
      credentialType,
      userFields: [],
      domain,
    };

    const response = await sendMessage("addCredential", {
      users: usersToShare,
      addCredentialFields,
    });
    addCredentialPaylod.userFields = response;
    if ($showEditCredentialDialog) {
      if ($credentialIdForEdit == null) {
        throw new Error("credential not selected for edit");
      }
      await updateCredential(addCredentialPaylod, $credentialIdForEdit);
    } else {
      await addCredential(addCredentialPaylod);
    }
    const responseJson = await fetchCredentialsByFolder($selectedFolder.id);
    const decryptedData = await sendMessage("decryptMeta", responseJson.data);
    credentialStore.set(decryptedData.data);
    showEditCredentialDialog.set(false);
    showCredentialEditor.set(false);
    isLoaderActive = false;
  };

  const credentialTypeSelection = (isLogin: boolean) => {
    loginSelected = isLogin;
    credentialFields = isLogin
      ? loginFields
      : [{ fieldName: "", fieldValue: "", sensitive: false }];
    credentialType = loginSelected ? "Login" : "Other";
  };

  onMount(async () => {
    credentialFields = loginFields;
    console.log($selectedFolder.id);
    if ($showEditCredentialDialog) {
      const [credentialDataForEdit] = $credentialStore.filter(
        (credentials) => credentials.credentialId === $credentialIdForEdit,
      );
      name = credentialDataForEdit.name;
      description = credentialDataForEdit.description;
      let sensitiveFields =
        await FetchSensitiveFieldsAndDecrypt($credentialIdForEdit);
      credentialFields = [...credentialDataForEdit.fields, ...sensitiveFields];
    }

    if ($selectedFolder === null) throw new Error("folder not selected");
    if (!$showEditCredentialDialog) {
      const responseJson = await fetchFolderUsersForDataSync(
        $selectedFolder.id,
      );
      usersToShare = responseJson.data;
    } else {
      const responseJson =
        await fetchCredentialUsersForDataSync($credentialIdForEdit);
      usersToShare = responseJson.data;
    }
  });

  function closeDialog() {
    showCredentialEditor.set(false);
    showEditCredentialDialog.set(false);
  }

  function deleteCredential() {
    console.log("Delete credential");
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
        {$showEditCredentialDialog
          ? "Edit login credential"
          : "Add Login credential"}
      </button>
      <button
        class="text-[1.4rem] font-sans font-normal ml-2 {!loginSelected
          ? 'text-osvauld-quarzowhite border-b-2 border-osvauld-carolinablue'
          : 'text-osvauld-sheffieldgrey '}"
        on:click={() => credentialTypeSelection(false)}
      >
        {$showEditCredentialDialog
          ? "Change to other credential"
          : "Add other credential"}
      </button>
    </div>
    <div>
      {#if $showEditCredentialDialog}
        <button class="bg-osvauld-frameblack p-4" on:click={deleteCredential}
          ><BinIcon /></button
        >
      {/if}

      <button class="bg-osvauld-frameblack p-4" on:click={closeDialog}
        ><ClosePanel /></button
      >
    </div>
  </div>

  <div class="border-b border-osvauld-iconblack w-full"></div>

  <div class="mx-6">
    <div
      class="min-h-[32vh] max-h-[35vh] overflow-y-scroll scrollbar-thin z-50"
    >
      <input
        class="w-[95%] h-[3.4rem] mb-2 mt-4 ml-4 pl-4 bg-osvauld-frameblack border rounded-xl text-3xl text-osvauld-quarzowhite font-normal focus:border-osvauld-activeBorder flex focus:ring-0 placeholder-osvauld-iconblack {notNamed
          ? 'border-red-500'
          : 'border-osvauld-iconblack '}"
        id="name"
        type="text"
        placeholder="Enter Credential name...."
        autocomplete="off"
        autofocus
        bind:value={name}
      />
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
      class="secondary-btn px-[3.25rem] py-2.5 mb-6 mr-3 w-[200px] whitespace-nowrap"
      on:click={closeDialog}>Cancel</button
    >
    <button
      class="primary-btn px-[3.25rem] py-2.5 mb-6 w-[200px] whitespace-nowrap flex justify-center items-center"
      on:click={saveCredential}
    >
      {#if isLoaderActive}
        <Loader size={24} color="#1F242A" duration={1} />
      {:else}
        <span
          >{$showEditCredentialDialog ? "Save Changes" : "Add credential"}</span
        >
      {/if}
    </button>
  </div>
</div>
