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
  import { Credential } from "../../dtos/credential.dto";
  import { User } from "../../dtos/user.dto";
  let checkedCards: Credential[] = [];
  let showDrawer = false;
  const openModal = () => {
    showAddCredentialDrawer.set(true);
  };

  const closeModal = () => {
    showAddCredentialDrawer.set(false);
  };
  const selectCredential = (credential: Credential) => {
    selectedCredential.set(credential);
    showDrawer = true;
  };
  function handleCheck(e: any, card: Credential) {
    if (e.target.checked) {
      checkedCards = [...checkedCards, card];
    } else {
      checkedCards = checkedCards.filter((c) => c.id !== card.id);
    }
  }
  function isChecked(credential: Credential) {
    return checkedCards.includes(credential);
  }
  let users: User[] = [];
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

<div class="bg-macchiato-surface1">
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
        class="bg rounded-md p-2 pl-2 mr-2 bg-macchiato-blue"
        on:click={openModal}>Create Credential</button
      >
      {#if checkedCards.length === 0}
        <!-- TODO: update to share credentials in the same api -->
        <button
          class="bg-macchiato-sapphire rounded-md p-2 pl-2 pr-2"
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
    <button
      class="fixed inset-0 flex items-center justify-center z-50"
      on:click={closeModal}
    >
      <button class="p-6 rounded bg-transparent" on:click|stopPropagation>
        <AddCredential on:close={closeModal} />
      </button>
    </button>
  {/if}
  {#if $showFolderShareDrawer}
    <button
      class="bg-[#182034] fixed inset-0 flex items-center justify-center z-50"
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
      class="bg-[#182034] fixed inset-0 flex items-center justify-center z-50"
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
    <!-- Left Side: List of Cards -->
    <div class="flex flex-wrap p-6 w-full">
      {#each $credentialStore as credential}
        <div
          class="mb-6 mr-2 flex-none hover:border hover:border-macchiato-green"
        >
          <button
            class="container mx-auto p-4 relative rounded-lg group bg-macchiato-surface0"
            on:click={() => selectCredential(credential)}
            on:keydown={(e) => {
              if (e.key === "Enter") {
                selectCredential(credential);
              }
            }}
          >
            <input
              type="checkbox"
              checked={isChecked(credential)}
              on:change={(e) => handleCheck(e, credential)}
            />
            <p class="mb-4 text-left">{credential.name}</p>
            <!-- Scrollable area for field names and values, starting after the first two fields -->
            <div
              class="overflow-y-auto max-h-[260px] min-h-[260px] scrollbar-thin"
            >
              {#each credential?.unencryptedData as field, index}
                <div class="mb-4">
                  <label
                    class="label block mb-2 text-left"
                    for={`input-${index}`}>{field.fieldName}</label
                  >
                  <div class="relative">
                    <input
                      class={`input pr-10 w-full rounded-2xl items-center bg-macchiato-surface0 border-macchiato-teal`}
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
          </button>
        </div>
      {/each}
    </div>
  </div>
</div>
{#if $selectedCredential && checkedCards.length < 2}
  <CredentialDetails />
{/if}
