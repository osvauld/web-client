<script lang="ts">
  import { fly } from "svelte/transition";
  import CredentialEditor from "./CredentialEditor.svelte";
  import ShareFolderModal from "../folders/ShareFolderModal.svelte";
  import ShareCredentialModal from "./ShareCredentialModal.svelte";
  import CredentialCard from "./CredentialCard.svelte";
  import CredentialDetails from "./CredentialDetails.svelte";

  import { Share, Add, InfoIcon, BinIcon } from "../icons";
  import {
    fetchFolderUsers,
    fetchAllUsers,
    fetchAllUserGroups,
    fetchAllFolders,
    removeFolder,
    fetchCredentialsByFolder,
  } from "../apis";
  import { User, Group, Credential, Fields } from "../dtos";

  import {
    credentialStore,
    showFolderShareDrawer,
    showCredentialShareDrawer,
    selectedFolder,
    showCredentialDetailsDrawer,
    folderStore,
    selectedCredential,
  } from "../store";
  import { onDestroy } from "svelte";
  import { sendMessage } from "../helper";
  import DownArrow from "../../basic/icons/downArrow.svelte";
  import Placeholder from "../components/Placeholder.svelte";

  let checkedCards: Credential[] = [];
  let users: User[] = [];
  let allGroups: Group[] = [];
  let selectedCard: any;
  let sensitiveFields: Fields[] = [];
  let areCardsSelected = false;
  let noCardsSelected = false;
  let showCreateCredentialModal = false;

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
    if (folder === null) {
      selectedFolder.set(null);
      return;
    }
    selectedCredential.set(null);
    const responseJson = await fetchCredentialsByFolder(folder.id);
    const response = await sendMessage("decryptMeta", responseJson.data);
    credentialStore.set(response.data);
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

  const folderShareManager = async () => {
    areCardsSelected = checkedCards.length !== 0;
    setTimeout(() => {
      areCardsSelected = false;
    }, 1000);
    !areCardsSelected && showFolderShareDrawer.set(true);
  };

  const credentialShareManager = async () => {
    noCardsSelected = checkedCards.length === 0;
    setTimeout(() => {
      noCardsSelected = false;
    }, 1000);
    !noCardsSelected && showCredentialShareDrawer.set(true);
  };

  const removeFolderHandler = async () => {
    await removeFolder($selectedFolder.id);
    selectedFolder.set(null);
    const responseJson = await fetchAllFolders();
    folderStore.set(responseJson.data);
  };

  const addCredentialManager = () => {
    showCreateCredentialModal = true;
    checkedCards = [];
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

<div class="w-full min-h-[80vh]">
  {#if $selectedFolder}
    <div class="flex justify-between items-center px-4 py-2">
      <div class="max-w-[50%] min-w-[30%] flex items-center">
        <h1 class="text-4xl p-4 font-normal whitespace-nowrap">
          {$selectedFolder.name}
        </h1>
        <!-- TODO: update to share credentials in the same api -->
        <button
          class="rounded-md border border-osvauld-iconblack py-2 px-4 !text-lg text-osvauld-textActive flex justify-between items-center whitespace-nowrap xl:scale-90"
          on:click={folderShareManager}
        >
          <Share color={"#A3A4B5"} /> <span class="ml-1">Share Folder</span>
        </button>
        <button
          class=" bg-osvauld-carolinablue rounded-md py-2 px-4 !text-lg text-osvauld-frameblack flex justify-between items-center whitespace-nowrap xl:scale-90"
          on:click={credentialShareManager}
        >
          <Share color={"#0D0E13"} /><span class="ml-1">Share Credentials</span>
        </button>
        <button on:click={removeFolderHandler}>
          <BinIcon />
        </button>
        {#if areCardsSelected}
          <span
            class="text-red-400 whitespace-nowrap text-sm ml-2 inline-block"
            in:fly
            out:fly>Credentials are selected</span
          >
        {:else if noCardsSelected}
          <span
            class="text-red-400 whitespace-nowrap text-sm ml-2 inline-block"
            in:fly
            out:fly>No cards are selected</span
          >
        {/if}
      </div>
      <div class="w-1/2 flex justify-end items-center">
        <button disabled class="scale-110">
          <InfoIcon />
        </button>
        <button
          class="border border-osvauld-iconblack text-osvauld-textPassive flex justify-center items-center py-2 px-4 xl:scale-90 rounded-md ml-4"
        >
          <span class="mr-1 pl-2">Latest</span>
          <DownArrow type={"common"} />
        </button>
        <button
          class="rounded-md py-2 px-4 mr-2 flex justify-center items-center whitespace-nowrap xl:scale-90 border text-osvauld-textActive border-osvauld-iconblack"
          on:click={addCredentialManager}
          disabled={checkedCards.length !== 0}
          ><Add color={"#A3A4B5"} />
          <span class="ml-1">Add New Credential</span>
        </button>
      </div>
    </div>
  {:else}
    <div class="w-full max-h-[100vh] min-h-[70vh] mt-20">
      <Placeholder />
    </div>
  {/if}
  {#if showCreateCredentialModal}
    <button
      class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
      on:click={() => !showCreateCredentialModal}
    >
      <button class="p-6 rounded bg-transparent" on:click|stopPropagation>
        <CredentialEditor
          on:close={() => (showCreateCredentialModal = false)}
        />
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
  {#if sortedCredentials.length !== 0}
    <div
      class="flex flex-wrap p-3 pl-7 gap-4 w-full max-h-[80vh] !overflow-y-scroll scrollbar-thin box-border"
    >
      {#each sortedCredentials as credential}
        <CredentialCard
          {credential}
          checked={checkedCards.some(
            (c) => c.credentialId === credential.credentialId
          )}
          on:check={(e) => handleCheck(e.detail, credential)}
          on:select={(e) => onSelectingCard(e.detail, credential)}
        />
      {/each}
    </div>
  {/if}
</div>
