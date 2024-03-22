<script lang="ts">
  import CredentialEditor from "./CredentialEditor.svelte";
  import ShareFolderModal from "../folders/ShareFolderModal.svelte";
  import ShareCredentialModal from "./ShareCredentialModal.svelte";
  import CredentialCard from "./CredentialCard.svelte";
  import CredentialDetails from "./CredentialDetails.svelte";

  import { Share, Add } from "../icons";
  import { fetchFolderUsers, fetchAllUsers, fetchAllUserGroups } from "../apis";
  import { User, Group, Credential, Fields } from "../dtos";

  import {
    credentialStore,
    showCredentialEditor,
    showFolderShareDrawer,
    showCredentialShareDrawer,
    selectedFolder,
    showCredentialDetailsDrawer,
  } from "../store";
  import { onDestroy } from "svelte";

  let checkedCards: Credential[] = [];
  let users: User[] = [];
  let allGroups: Group[] = [];
  let selectedCard: any;
  let sensitiveFields: Fields[] = [];
  $: addIconColor = checkedCards.length === 0 ? "#000" : "#6E7681";
  $: sortedCredentials = $credentialStore.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  function handleCheck(isChecked: boolean, card: Credential) {
    if (isChecked) {
      checkedCards = [...checkedCards, card];
    } else {
      checkedCards = checkedCards.filter(
        (c) => c.credentialId !== card.credentialId
      );
    }
  }
  const subscribe = selectedFolder.subscribe(async (folder) => {
    //TODO: fetch shared groups.
    if (folder === null) return;
    let [allUsersResponse, folderUsersResponse, allGroupResponse] =
      await Promise.all([
        fetchAllUsers(),
        fetchFolderUsers(folder.id),
        fetchAllUserGroups(),
      ]);
    allGroups = allGroupResponse.data;
    users = allUsersResponse.data.filter((user) => {
      return !folderUsersResponse.data.some(
        (folderUser) => folderUser.id === user.id
      );
    });
    checkedCards = [];
  });

  const withdrawDetailDrawer = () => {
    showCredentialDetailsDrawer.set(false);
  };

  const onSelectingCard = (
    sensitiveFieldsfromCard: Fields[],
    credential: Credential
  ) => {
    sensitiveFields = [...sensitiveFieldsfromCard];
    selectedCard = credential;
    showCredentialDetailsDrawer.set(true);
  };

  onDestroy(() => {
    subscribe();
  });
</script>

{#if $showCredentialDetailsDrawer}
  <button
    class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
    on:click={withdrawDetailDrawer}
  >
    <button class="p-6 rounded bg-transparent" on:click|stopPropagation>
      <CredentialDetails
        credential={selectedCard}
        {sensitiveFields}
        on:close={withdrawDetailDrawer}
      />
    </button>
  </button>
{/if}

<div>
  {#if $selectedFolder}
    <div class="flex justify-between items-center px-4 py-2">
      <div class="max-w-[50%] min-w-[30%] flex items-center">
        <h1 class="text-4xl p-4 font-normal whitespace-nowrap">
          {$selectedFolder.name}
        </h1>
        <!-- TODO: update to share credentials in the same api -->
        <button
          class=" bg-osvauld-carolinablue rounded-md py-1 px-4 !text-lg text-osvauld-frameblack flex justify-between items-center whitespace-nowrap xl:scale-90 lg:scale-95 md:scale-90 sm:scale-75"
          on:click={() => showFolderShareDrawer.set(true)}
        >
          <Share /> <span class="ml-1">Share Folder</span>
        </button>
        <button
          class=" bg-osvauld-carolinablue rounded-md py-1 px-4 !text-lg text-osvauld-frameblack flex justify-between items-center whitespace-nowrap xl:scale-90 lg:scale-95 md:scale-90 sm:scale-75"
          on:click={() => showCredentialShareDrawer.set(true)}
        >
          <Share /><span class="ml-1">Share Secrets</span>
        </button>
      </div>
      <button
        class="bg rounded-md py-1 px-4 mr-2 flex justify-center items-center whitespace-nowrap xl:scale-90 lg:scale-95 md:scale-90 sm:scale-75 {checkedCards.length ===
        0
          ? 'bg-osvauld-carolinablue text-osvauld-ninjablack'
          : 'bg-osvauld-iconblack text-osvauld-sheffieldgrey'}"
        on:click={() => showCredentialEditor.set(true)}
        disabled={checkedCards.length !== 0}
        ><Add color={addIconColor} />
        <span class="ml-1"> Add New Credential</span>
      </button>
    </div>
  {/if}
  {#if $showCredentialEditor}
    <button
      class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
      on:click={() => showCredentialEditor.set(false)}
    >
      <button class="p-6 rounded bg-transparent" on:click|stopPropagation>
        <CredentialEditor on:close={() => showCredentialEditor.set(false)} />
      </button>
    </button>
  {/if}
  {#if $showFolderShareDrawer}
    <button
      class="fixed inset-0 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px] flex items-center justify-center z-50"
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
      class="fixed inset-0 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px] flex items-center justify-center z-50"
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
    {#each sortedCredentials as credential, index}
      <div class="px-1 pb-1">
        <CredentialCard
          {credential}
          {index}
          on:check={(e) => handleCheck(e.detail, credential)}
          on:select={(e) => onSelectingCard(e.detail, credential)}
        />
      </div>
    {/each}
  </div>
</div>
