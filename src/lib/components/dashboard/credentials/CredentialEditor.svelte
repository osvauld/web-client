<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { ClosePanel, Add, BinIcon } from "../icons";
  import Loader from "../components/Loader.svelte";
  import { createEventDispatcher } from "svelte";
  import { selectedFolder, credentialStore } from "../store";

  import {
    fetchFolderUsersForDataSync,
    addCredential,
    updateCredential,
    fetchCredentialsByFolder,
    fetchCredentialUsersForDataSync,
  } from "../apis";

  import {
    AddCredentialPayload,
    Fields,
    User,
    AddCredentialField,
  } from "../dtos";
  import AddLoginFields from "./AddLoginFields.svelte";
  import { sendMessage } from "../helper";
  import { setCredentialStore } from "../../../store/storeHelper";

  export let edit = false;
  export let credentialFields = [
    { fieldName: "Username", fieldValue: "", sensitive: false },
    { fieldName: "Password", fieldValue: "", sensitive: true },
    { fieldName: "URL", fieldValue: "https://", sensitive: false },
  ];
  export let credentialId = null;
  export let description = "";
  export let name = "";
  export let credentialType = "Login";
  let notNamed = false;
  let isLoaderActive: boolean = false;
  let usersToShare: User[] = [];
  let addCredentialPaylod: AddCredentialPayload;
  let hoveredIndex: Number | null = null;
  let errorMessage = "";

  const dispatcher = createEventDispatcher();
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

  const saveCredential = async () => {
    isLoaderActive = true;
    errorMessage = "";
    if ($selectedFolder === null) throw new Error("folder not selected");
    if (name.length === 0) {
      isLoaderActive = false;
      notNamed = true;
      setTimeout(() => {
        notNamed = false;
      }, 1000);
      return;
    }
    let domain = "";
    let addCredentialFields: Fields[] = [];
    for (const field of credentialFields) {
      if (field.fieldName === "URL" && edit === false) {
        try {
          if (field.fieldValue === "https://") {
            errorMessage = "Invalid URL";
            isLoaderActive = false;
            return;
          }
          domain = new URL(field.fieldValue).hostname;
          addCredentialFields.push({
            fieldName: "Domain",
            fieldValue: domain,
            fieldType: "additional",
          });
        } catch (error) {
          errorMessage = "Invalid URL";
          isLoaderActive = false;
          return;
        }
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
    if (edit) {
      if (credentialId == null) {
        throw new Error("credential not selected for edit");
      }
      await updateCredential(addCredentialPaylod, credentialId);
    } else {
      await addCredential(addCredentialPaylod);
    }
    await setCredentialStore();
    isLoaderActive = false;
    dispatcher("close");
  };

  const credentialTypeSelection = (isLogin: boolean) => {
    credentialType = isLogin ? "Login" : "Other";
    if (credentialType === "Other") {
      credentialFields = [
        {
          fieldName: "Field Name",
          fieldValue: "",
          sensitive: false,
        },
      ];
    } else {
      credentialFields = [
        { fieldName: "Username", fieldValue: "", sensitive: false },
        { fieldName: "Password", fieldValue: "", sensitive: true },
        { fieldName: "URL", fieldValue: "https://", sensitive: false },
      ];
    }
  };

  onMount(async () => {
    if (edit) {
      const responseJson = await fetchCredentialUsersForDataSync(credentialId);
      usersToShare = responseJson.data;
    } else {
      const responseJson = await fetchFolderUsersForDataSync(
        $selectedFolder.id,
      );
      usersToShare = responseJson.data;
    }
  });

  function closeDialog() {
    dispatcher("close");
  }

  function deleteCredential() {
    console.log("Delete credential");
  }

  function triggerSensitiveBubble(index: number, isEnter: boolean) {
    isEnter ? (hoveredIndex = index) : (hoveredIndex = null);
  }
</script>

<form on:submit|preventDefault={saveCredential}>
  <div
    class="bg-osvauld-frameblack rounded-3xl border border-osvauld-iconblack z-50"
    in:fly
  >
    <div class="flex justify-between items-center px-12 py-6">
      <div>
        <button
          class="text-[1.4rem] font-sans font-normal {credentialType === 'Login'
            ? 'text-osvauld-quarzowhite border-b-2 border-osvauld-carolinablue'
            : 'text-osvauld-sheffieldgrey '}"
          on:click={() => credentialTypeSelection(true)}
        >
          {edit ? "Edit login credential" : "Add Login credential"}
        </button>
        <button
          class="text-[1.4rem] font-sans font-normal ml-2 {credentialType ===
          'Other'
            ? 'text-osvauld-quarzowhite border-b-2 border-osvauld-carolinablue'
            : 'text-osvauld-sheffieldgrey '}"
          on:click={() => credentialTypeSelection(false)}
        >
          {edit ? "Edit other" : "Add other"}
        </button>
      </div>
      <div>
        {#if edit}
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
          class="w-[78%] mb-2 mt-4 ml-6 pl-4 bg-osvauld-frameblack
           border rounded-md text-base text-osvauld-quarzowhite font-normal
           focus:border-osvauld-activeBorder flex focus:ring-0 placeholder-osvauld-iconblack {notNamed
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
    {#if errorMessage !== ""}
      {errorMessage}
    {/if}
    <div class="border-b border-osvauld-iconblack w-full my-2"></div>
    <div class="flex justify-end items-center mx-10 py-2">
      <button
        class="secondary-btn px-[3.25rem] py-2.5 mb-6 mr-3 w-[200px] whitespace-nowrap"
        on:click={closeDialog}>Cancel</button
      >
      <button
        type="submit"
        class="primary-btn px-[3.25rem] py-2.5 mb-6 w-[200px] whitespace-nowrap flex justify-center items-center"
        disabled={isLoaderActive}
      >
        {#if isLoaderActive}
          <Loader size={24} color="#1F242A" duration={1} />
        {:else}
          <span>{edit ? "Save Changes" : "Add credential"}</span>
        {/if}
      </button>
    </div>
  </div>
</form>
