<script lang="ts">
  import AddCredential from "./AddCredential.svelte";
  import ShareFolderModal from "../folders/ShareFolderModal.svelte";
  import ShareCredentialModal from "./ShareCredentialModal.svelte";
  import CredentialCard from "./CredentialCard.svelte";

  import { Lens, Share, Add } from "../icons";
  import { fetchFolderUsers, fetchAllUsers, fetchAllUserGroups } from "../apis";
  import { User, Group, Credential } from "../dtos";

  import CredentialDetails from "./CredentialDetails.svelte";
  import {
    credentialStore,
    showAddCredentialDrawer,
    showFolderShareDrawer,
    showCredentialShareDrawer,
    selectedFolder,
    showCredentialDetailsDrawer,
  } from "../store";
  import { onDestroy } from "svelte";

  let checkedCards: Credential[] = [];
  let users: User[] = [];
  let allGroups: Group[] = [];

  function handleCheck(isChecked: boolean, card: Credential) {
    if (isChecked) {
      checkedCards = [...checkedCards, card];
    } else {
      checkedCards = checkedCards.filter(
        (c) => c.credentialId !== card.credentialId,
      );
    }
  }
  const subscribe = selectedFolder.subscribe(async (folder) => {
    //TODO: fetch shared groups.
    if (folder === null) return;
    let folderUsersResponse;
    let allUsersResponse;
    let allGroupResponse;
    [allUsersResponse, folderUsersResponse, allGroupResponse] =
      await Promise.all([
        fetchAllUsers(),
        fetchFolderUsers(folder.id),
        fetchAllUserGroups(),
      ]);
    allGroups = allGroupResponse.data;
    users = allUsersResponse.data.filter((user) => {
      return !folderUsersResponse.data.some(
        (folderUser) => folderUser.id === user.id,
      );
    });
    checkedCards = [];
  });

  onDestroy(() => {
    subscribe();
  });
</script>

<div>
  {#if $selectedFolder}
    <div class="flex items-center px-4 py-2">
      <h1 class="text-4xl p-4 font-normal w-1/3">{$selectedFolder.name}</h1>
      {#if checkedCards.length === 0}
        <!-- TODO: update to share credentials in the same api -->
        <button
          class="bg-osvauld-carolinablue rounded-md py-1 px-4 !text-lg text-macchiato-surface0 flex justify-center items-center whitespace-nowrap xl:scale-90 lg:scale-95 md:scale-90 sm:scale-75"
          on:click={() => showFolderShareDrawer.set(true)}
        >
          <Share /> <span class="ml-1"> Manage Access</span>
        </button>
      {:else}
        <button
          class="bg-osvauld-carolinablue rounded-md py-1 px-4 !text-lg text-macchiato-surface0 flex justify-center items-center whitespace-nowrap xl:scale-90 lg:scale-95 md:scale-90 sm:scale-75"
          on:click={() => showCredentialShareDrawer.set(true)}
        >
          <Share /><span class="ml-1"> Share Secrets </span>
        </button>
      {/if}
      <div
        class="h-[2.1rem] w-1/4 px-2 mx-auto flex justify-start items-center border border-osvauld-iconblack rounded-lg cursor-pointer"
      >
        <Lens />
        <input
          type="text"
          class="h-[1.76rem] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
          placeholder="Find what you need faster.."
        />
      </div>
      <button
        class="bg rounded-md py-1 px-4 mr-2 bg-osvauld-carolinablue text-macchiato-surface0 flex justify-center items-center whitespace-nowrap xl:scale-90 lg:scale-95 md:scale-90 sm:scale-75"
        on:click={() => showAddCredentialDrawer.set(true)}
        ><span class="mr-1"> Add Credential</span> <Add />
      </button>
    </div>
  {/if}
  {#if $showAddCredentialDrawer}
    <button
      class="fixed inset-0 flex items-center justify-center z-50 bg-[#010409ad] backdrop-filter backdrop-blur-[2px]"
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
        <ShareFolderModal
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
        <ShareCredentialModal
          {users}
          credentials={checkedCards}
          groups={allGroups}
          on:close={() => showCredentialShareDrawer.set(false)}
        />
      </button>
    </button>
  {/if}
  <div
    class="flex flex-wrap p-3 w-full max-h-[85vh] !overflow-y-scroll scrollbar-thin"
  >
    {#each $credentialStore as credential, index}
      <div class="px-1 pb-1">
        <CredentialCard
          {credential}
          {index}
          on:check={(e) => handleCheck(e.detail, credential)}
        />
      </div>
    {/each}
  </div>
</div>
