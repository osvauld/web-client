<script lang="ts">
  import AddCredential from "./AddCredential.svelte";
  import ShareFolder from "../folders/ShareFolder.svelte";
  import ShareCredential from "./ShareCredential.svelte";
  import CredentialCard from "./CredentialCard.svelte";

  import { fetchFolderUsers, fetchAllUsers } from "../apis";

  import { User, CredentialDetails } from "../dtos";

  import {
    credentialStore,
    showAddCredentialDrawer,
    showFolderShareDrawer,
    showCredentialShareDrawer,
    selectedFolder,
  } from "../store";

  let checkedCards: CredentialDetails[] = [];
  let users: User[] = [];

  function handleCheck(isChecked: boolean, card: CredentialDetails) {
    if (isChecked) {
      checkedCards = [...checkedCards, card];
    } else {
      checkedCards = checkedCards.filter((c) => c.id !== card.id);
    }
  }

  const openshareFolderDrawer = async () => {
    const allUsers = await fetchAllUsers();
    if ($selectedFolder === null) throw new Error("folder not selected");
    const folderUsers = await fetchFolderUsers($selectedFolder.id);
    users = allUsers.filter((user) => {
      return !folderUsers.some((folderUser) => folderUser.id === user.id);
    });
    showFolderShareDrawer.set(true);
  };
  const openShareCredentialDrawer = async () => {
    //TODO: update users to not include users shared with as custom
    if (!$selectedFolder) throw new Error("folder not selected");
    const allUsers = await fetchAllUsers();
    const folderUsers = await fetchFolderUsers($selectedFolder.id);
    users = allUsers.filter((user) => {
      return !folderUsers.some((folderUser) => folderUser.id === user.id);
    });
    showCredentialShareDrawer.set(true);
  };
</script>

<div class="bg-macchiato-mantle">
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

      <button
        class="bg rounded-md p-2 pl-2 mr-2 bg-macchiato-blue text-macchiato-surface0"
        on:click={() => showAddCredentialDrawer.set(true)}
        >Create Credential</button
      >
      {#if checkedCards.length === 0}
        <!-- TODO: update to share credentials in the same api -->
        <button
          class="bg-macchiato-sapphire rounded-md p-2 pl-2 pr-2 text-macchiato-surface0"
          on:click={openshareFolderDrawer}>Share Folder</button
        >
      {:else}
        <button
          class="bg-macchiato-sapphire rounded-md p-2 pl-2 text-macchiato-surface0"
          on:click={openShareCredentialDrawer}>Share Secrets</button
        >
      {/if}
    </div>
  {/if}
  {#if $showAddCredentialDrawer}
    <button
      class="fixed inset-0 flex items-center justify-center z-50"
      on:click={() => showAddCredentialDrawer.set(false)}
    >
      <button class="p-6 rounded bg-transparent" on:click|stopPropagation>
        <AddCredential on:close={() => showAddCredentialDrawer.set(false)} />
      </button>
    </button>
  {/if}
  {#if $showFolderShareDrawer}
    <button
      class="bg-transparent fixed inset-0 flex items-center justify-center z-50"
      on:click={() => showFolderShareDrawer.set(false)}
    >
      <button class="p-6 rounded shadow-lg" on:click|stopPropagation>
        <ShareFolder
          {users}
          on:close={() => showFolderShareDrawer.set(false)}
        />
      </button>
    </button>
  {/if}
  {#if $showCredentialShareDrawer}
    <button
      class="bg-transparent fixed inset-0 flex items-center justify-center z-50"
      on:click={() => showCredentialShareDrawer.set(false)}
    >
      <button class="p-6 rounded shadow-lg" on:click|stopPropagation>
        <ShareCredential
          {users}
          creds={checkedCards}
          on:close={() => showCredentialShareDrawer.set(false)}
        />
      </button>
    </button>
  {/if}
  <div class="flex overflow-x-auto">
    <div class="flex flex-wrap p-6 w-full">
      {#each $credentialStore as credential}
        <CredentialCard
          {credential}
          on:check={(e) => handleCheck(e.detail, credential)}
        />
      {/each}
    </div>
  </div>
</div>
