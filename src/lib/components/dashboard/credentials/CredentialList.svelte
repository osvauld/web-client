<script lang="ts">
  import { fly } from "svelte/transition";
  import CredentialEditor from "./CredentialEditor.svelte";
  import ShareFolderModal from "../folders/ShareFolderModal.svelte";
  import ShareCredentialModal from "./ShareCredentialModal.svelte";
  import CredentialCard from "./CredentialCard.svelte";
  import CredentialDetails from "./CredentialDetails.svelte";

  import { Share, Add, EyeScan } from "../icons";
  import { fetchSignedUpUsers, fetchAllUserGroups } from "../apis";
  import { User, Group, Credential, Fields } from "../dtos";

  import {
    credentialStore,
    showFolderShareDrawer,
    showCredentialShareDrawer,
    selectedFolder,
    showCredentialDetailsDrawer,
    selectedCredential,
  } from "../store";
  import { onDestroy } from "svelte";
  import DownArrow from "../../basic/icons/downArrow.svelte";
  import Placeholder from "../components/Placeholder.svelte";
  import { accessListSelected, buttonRef } from "../../../store/ui.store";
  import { setCredentialStore } from "../../../store/storeHelper";

  let checkedCards: Credential[] = [];
  let users: User[] = [];
  let allGroups: Group[] = [];
  let selectedCard: any;
  let sensitiveFields: Fields[] = [];
  let areCardsSelected = false;
  let noCardsSelected = false;
  let showCreateCredentialModal = false;
  let isShareHovered = false;
  let accesslistHovered = false;
  let addCredentialHovered = false;
  let isShareCredHovered = false;

  $: sortedCredentials = $credentialStore.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

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
    if (folder === null) {
      selectedFolder.set(null);
      return;
    }
    selectedCredential.set(null);
    await setCredentialStore();
    let [allUsersResponse, allGroupResponse] = await Promise.all([
      fetchSignedUpUsers(),
      fetchAllUserGroups(),
    ]);
    allGroups = allGroupResponse.data;
    users = allUsersResponse.data;
    checkedCards = [];
  });

  const withdrawDetailDrawer = () => {
    showCredentialDetailsDrawer.set(false);
  };

  const onSelectingCard = (
    sensitiveFieldsfromCard: Fields[],
    credential: Credential,
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

  const addCredentialManager = () => {
    showCreateCredentialModal = true;
    checkedCards = [];
  };

  const handleAccessListSelection = (e: any) => {
    buttonRef.set(e.currentTarget);
    accessListSelected.set(true);
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
        {#if $selectedFolder.accessType === "manager"}
          <button
            class="py-1.5 px-4 !text-lg text-osvauld-textActive flex justify-between items-center whitespace-nowrap text-sm mr-2"
            on:click={folderShareManager}
            on:mouseenter={() => (isShareHovered = true)}
            on:mouseleave={() => (isShareHovered = false)}
          >
            <Share color={isShareHovered ? "#F2F2F0" : "#85889C"} size={28} />
          </button>
        {/if}
        {#if checkedCards.length !== 0}
          <button
            class="border border-osvauld-iconblack rounded-md py-1.5 px-4 !text-lg text-osvauld-textActive flex justify-between items-center whitespace-nowrap hover:text-osvauld-frameblack hover:bg-osvauld-carolinablue"
            on:click={credentialShareManager}
            on:mouseenter={() => (isShareCredHovered = true)}
            on:mouseleave={() => (isShareCredHovered = false)}
          >
            <Share
              color={isShareCredHovered ? "#0D0E13" : "#A3A4B5"}
              size={16}
            /><span class="ml-1 text-sm">Share Credentials</span>
          </button>
        {/if}
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

      <div class="w-[40%] flex justify-end items-center">
        <button
          class="hover:bg-osvauld-modalFieldActive {$accessListSelected
            ? 'bg-osvauld-modalFieldActive text-osvauld-carolinablue'
            : 'bg-osvauld-frameblack text-osvauld-fieldText'} rounded-md flex justify-around items-center px-4 py-1.5 text-sm {$selectedFolder.accessType ===
          'none'
            ? 'hidden'
            : 'visible'}"
          on:click={handleAccessListSelection}
          on:mouseenter={() => (accesslistHovered = true)}
          on:mouseleave={() => (accesslistHovered = false)}
        >
          <EyeScan
            color={$accessListSelected
              ? "#89B4FA"
              : accesslistHovered
                ? "#F2F2F0"
                : "#85889C"}
          />
          <span
            class="ml-2 whitespace-nowrap {$accessListSelected
              ? 'text-osvauld-carolinablue'
              : accesslistHovered
                ? 'text-osvauld-sideListTextActive'
                : 'text-osvauld-fieldText'} ">Access List</span
          >
        </button>
        <button
          class="border border-osvauld-iconblack text-osvauld-textPassive hidden justify-center items-center py-1.5 px-4 text-sm rounded-md ml-4"
        >
          <span class="mr-2 pl-2">Latest</span>
          <DownArrow type={"common"} />
        </button>
        <button
          class="rounded-md py-1.5 px-4 mx-2 flex justify-center items-center whitespace-nowrap text-sm border text-osvauld-textActive border-osvauld-iconblack hover:text-osvauld-frameblack hover:bg-osvauld-carolinablue {$selectedFolder.accessType ===
          'manager'
            ? 'visible'
            : 'hidden'}"
          on:mouseenter={() => (addCredentialHovered = true)}
          on:mouseleave={() => (addCredentialHovered = false)}
          on:click={addCredentialManager}
          disabled={checkedCards.length !== 0}
          ><Add color={addCredentialHovered ? "#0D0E13" : "#A3A4B5"} />
          <span class="ml-2">Add New Credential</span>
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
            (c) => c.credentialId === credential.credentialId,
          )}
          on:check={(e) => handleCheck(e.detail, credential)}
          on:select={(e) => onSelectingCard(e.detail, credential)}
        />
      {/each}
    </div>
  {/if}
</div>
