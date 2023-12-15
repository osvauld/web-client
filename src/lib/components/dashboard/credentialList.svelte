<script lang="ts">
  import {
    credentialStore,
    selectedCredential,
  } from "../../store/credential.store";
  import {
    showAddCredentialDrawer,
    showFolderShareDrawer,
    showCredentialShareDrawer,
  } from "../../store/ui.store";
  import { selectedFolder } from "../../store/folder.store";
  import CredentialDetails from "./credentailDetails.svelte";
  import AddCredential from "./AddCredential.svelte";
  import ShareFolder from "./ShareFolder.svelte";
  import CopyIcon from "../basic/copyIcon.svelte";
  import { fetchAllUsers } from "../../apis/user.api";
  import { fetchFolderUsers } from "../../apis/folder.api";
  import ShareCredential from "./ShareCredential.svelte";
  let checkedCards = [];
  let showDrawer = false;
  const openModal = () => {
    showAddCredentialDrawer.set(true);
  };

  const closeModal = () => {
    showAddCredentialDrawer.set(false);
  };
  const selectCredential = (credential) => {
    selectedCredential.set(credential);
    showDrawer = true;
  };
  function handleCheck(e, card) {
    if (e.target.checked) {
      checkedCards = [...checkedCards, card];
    } else {
      checkedCards = checkedCards.filter((c) => c.id !== card.id);
    }
  }
  function isChecked(credential) {
    return checkedCards.includes(credential);
  }
  let users = [];
  const openshareFolderDrawer = async () => {
    const responseJson = await fetchAllUsers();
    const fetchFolderUsersResponse = await fetchFolderUsers($selectedFolder.id);
    const allUsers = responseJson.data;
    const folderUsers = fetchFolderUsersResponse.data;
    users = allUsers.filter((user) => {
      return !folderUsers.some((folderUser) => folderUser.id === user.id);
    });
    showFolderShareDrawer.set(true);
  };

  const openShareCredentialDrawer = async () => {
    //TODO: update users to not include users shared with as custom
    const responseJson = await fetchAllUsers();
    const fetchFolderUsersResponse = await fetchFolderUsers($selectedFolder.id);
    const allUsers = responseJson.data;
    const folderUsers = fetchFolderUsersResponse.data;
    users = allUsers.filter((user) => {
      return !folderUsers.some((folderUser) => folderUser.id === user.id);
    });
    showCredentialShareDrawer.set(true);
  };
</script>

{#if $selectedFolder}
  <div class="flex items-center p-4">
    <h1 class="text-4xl p-4 italic">{$selectedFolder.name}</h1>
    <div class="rounded-full flex items-center">
      <input
        type="search"
        placeholder="Search"
        class="bg-transparent ml-4 mr-4 pl-8 py-1 rounded-full w-full focus:outline-none"
      />
    </div>

    <button class="bg-[#4E46DC] rounded-md p-2 pl-2 mr-2" on:click={openModal}
      >Create Credential</button
    >
    {#if checkedCards.length === 0}
      <!-- TODO: update to share credentials in the same api -->
      <button
        class="bg-[#4E46DC] rounded-md p-2 pl-2 pr-2"
        on:click={openshareFolderDrawer}>Share Folder</button
      >
    {:else}
      <button
        class="bg-[#4E46DC] rounded-md p-2 pl-2"
        on:click={openShareCredentialDrawer}>Share Secrets</button
      >
    {/if}
  </div>
{/if}
{#if $showAddCredentialDrawer}
  <div
    class="bg-[#182034] fixed inset-0 flex items-center justify-center z-50"
    on:click={closeModal}
  >
    <div class="p-6 rounded shadow-lg" on:click|stopPropagation>
      <AddCredential on:close={closeModal} />
    </div>
  </div>
{/if}
{#if $showFolderShareDrawer}
  <div
    class="bg-[#182034] fixed inset-0 flex items-center justify-center z-50"
    on:click={() => showFolderShareDrawer.set(false)}
  >
    <div class="p-6 rounded shadow-lg" on:click|stopPropagation>
      <ShareFolder {users} on:close={() => showFolderShareDrawer.set(false)} />
    </div>
  </div>
{/if}
{#if $showCredentialShareDrawer}
  <div
    class="bg-[#182034] fixed inset-0 flex items-center justify-center z-50"
    on:click={() => showCredentialShareDrawer.set(false)}
  >
    <div class="p-6 rounded shadow-lg" on:click|stopPropagation>
      <ShareCredential
        {users}
        creds={checkedCards}
        on:close={() => showCredentialShareDrawer.set(false)}
      />
    </div>
  </div>
{/if}
<div class="flex overflow-x-auto">
  <!-- Left Side: List of Cards -->
  <div class="flex flex-wrap p-6 w-full">
    {#each $credentialStore as credential}
      <div class="mb-6 mr-2 flex-none">
        <div
          class="container mx-auto p-4 relative card card-hover rounded-lg group h-auto bg-[#1D1D1D]"
          on:click={() => selectCredential(credential)}
        >
          <input
            type="checkbox"
            checked={isChecked(credential)}
            on:change={(e) => handleCheck(e, credential)}
          />
          <p class="mb-4">{credential.name}</p>
          <!-- Scrollable area for field names and values, starting after the first two fields -->
          <div class="overflow-y-auto max-h-[260px] min-h-[260px]">
            {#each credential?.unencryptedData as field, index}
              <div class="mb-4">
                <label class="label block mb-2">{field.fieldName}</label>
                <div class="relative">
                  <input
                    class="input pr-10 w-full rounded-2xl items-center bg-[#1C1C1C]"
                    type="text"
                    value={field.fieldValue}
                  />
                  <button
                    class="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <CopyIcon />
                  </button>
                </div>
              </div>
            {/each}
          </div>
          <!-- Static description at the bottom -->
          <p class="mb-4">{credential.description}</p>
        </div>
      </div>
    {/each}
  </div>
</div>

{#if $selectedCredential && checkedCards.length < 2}
  <CredentialDetails />
{/if}
