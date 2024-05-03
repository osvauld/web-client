<script lang="ts">
  import browser from "webextension-polyfill";
  import {
    addCredential,
    fetchAllFolders,
    fetchFolderUsersForDataSync,
  } from "../dashboard/apis";
  import { sendMessage } from "../dashboard/helper";
  import { spawn } from "child_process";
  export let username = "";
  export let password = "";
  export let domain = "";
  export let windowId;
  let name = "";
  let description = "";
  let showFolderList = false;
  let folderData = [];

  let addCredentialPayload = {
    name: name,
    folderId: "",
    description: description,
    credentialType: "Login",
    userFields: [],
    domain,
  };
  // Function to handle form submission
  const handleSubmit = async () => {
    const credential = { username, password, domain, name, description };

    const responseJson = await fetchAllFolders();
    folderData = responseJson.data.sort((a, b) => a.name.localeCompare(b.name));
    showFolderList = true;
    console.log("Submitting credential:", credential);

    // Implement actual data handling here, such as an API call
  };

  const handleFolderSelect = async (folderId) => {
    console.log("Selected folder:", folderId);
    const response = await fetchFolderUsersForDataSync(folderId);
    const usersToShare = response.data;
    const fieldPayload = [
      { fieldName: "Username", fieldValue: username, fieldType: "meta" },
      {
        fieldName: "Password",
        fieldValue: password,
        fieldType: "sensitive",
      },
      {
        fieldName: "Domain",
        fieldValue: domain,
        fieldType: "additional",
      },
      { fieldName: "URL", fieldValue: domain, fieldType: "meta" },
    ];
    addCredentialPayload.folderId = folderId;
    const userFields = await sendMessage("addCredential", {
      users: usersToShare,
      addCredentialFields: fieldPayload,
    });
    addCredentialPayload.name = name;
    addCredentialPayload.description = description;
    addCredentialPayload.userFields = userFields;
    console.log(addCredentialPayload);
    await addCredential(addCredentialPayload);
    showFolderList = false;
    await browser.windows.remove(windowId);
    // showFolderList = false;
  };
</script>

{#if showFolderList}
  <div class="text-osvauld-textActive text-base max-w-full pl-4">
    Select Folder to add this credential
  </div>
  <ul>
    {#each folderData as folder}
      <li>
        <button on:click={() => handleFolderSelect(folder.id)}>
          <div class="p-2 mb-2 bg-white">{folder.name}</div>
        </button>
      </li>
    {/each}
  </ul>
{:else}
  <div class="text-osvauld-textActive text-base max-w-full pl-4">
    Do you want to add this credential to osvauld?
  </div>
  <form
    on:submit|preventDefault={handleSubmit}
    class="flex flex-col p-4 max-w-sm mx-auto space-y-2 text-osvauld-textActive"
  >
    <div>
      <input
        id="name"
        type="text"
        placeholder="Enter credential name"
        bind:value={name}
        class="mt-1 block w-full px-3 py-1 rounded-md shadow-sm sm:text-sm bg-osvauld-frameblack border-osvauld-iconblack focus:border-osvauld-iconblack focus:ring-0"
        autocomplete="off"
      />
    </div>
    <div>
      <label
        for="username"
        class="block text-sm font-medium text-osvauld-textActive"
        >Username</label
      >
      <input
        id="username"
        type="text"
        bind:value={username}
        autocomplete="off"
        class="mt-1 block w-full px-3 py-1 shadow-sm sm:text-sm text-osvauld-fieldTextActive bg-osvauld-fieldActive rounded-md border-0 focus:border-osvauld-iconblack focus:ring-0"
      />
    </div>
    <div>
      <label
        for="password"
        class="block text-sm font-medium text-osvauld-textActive"
        >Password</label
      >
      <input
        id="password"
        type="password"
        bind:value={password}
        autocomplete="off"
        class="mt-1 block w-full px-3 py-1 shadow-sm sm:text-sm text-osvauld-fieldTextActive bg-osvauld-fieldActive rounded-md border-0 focus:border-osvauld-iconblack focus:ring-0"
      />
    </div>
    <div>
      <label
        for="domain"
        class="block text-sm font-medium text-osvauld-textActive">Domain</label
      >
      <input
        id="domain"
        type="text"
        bind:value={domain}
        autocomplete="off"
        class="mt-1 block w-full px-3 py-1 shadow-sm sm:text-sm text-osvauld-fieldTextActive bg-osvauld-fieldActive rounded-md border-0 focus:border-osvauld-iconblack focus:ring-0"
      />
    </div>

    <div>
      <label
        for="description"
        class="block text-sm font-medium text-osvauld-textActive"
        >Description</label
      >
      <textarea
        id="description"
        bind:value={description}
        rows="3"
        class="mt-1 block w-full px-3 py-1 shadow-sm sm:text-sm text-osvauld-fieldTextActive bg-osvauld-frameblack rounded-md border border-osvauld-iconblack focus:border-osvauld-iconblack focus:ring-0"
      ></textarea>
    </div>
    <button
      type="submit"
      class="px-4 py-2 bg-osvauld-carolinablue text-osvauld-frameblack font-normal rounded-md active::scale-95"
    >
      Next
    </button>
  </form>
{/if}
