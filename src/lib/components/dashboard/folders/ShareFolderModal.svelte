<script lang="ts">
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";

  import { fetchCredentialsFieldsByFolderId } from "../apis";
  import { selectedFolder, showFolderShareDrawer } from "../store";
  import { User, CredentialFields } from "../dtos";
  import { InfoIcon, ClosePanel } from "../icons";

  import ShareFolderWithGroups from "./ShareFolderWithGroups.svelte";
  import UserGroupToggle from "../UserGroupToggle.svelte";
  import ShareFolderWithUsers from "./ShareFolderWithUsers.svelte";
  import InfoOverlay from "../components/Info.svelte";

  export let users: User[];
  let credentialsFields: CredentialFields[];
  let infoDropdown = false;
  let infoOnHover = false;
  let showInfoTab = false;
  $: saveEnabled = false;
  let selectedTab = "Groups";

  onMount(async () => {
    if (!$selectedFolder) throw new Error("folder not selected");
    const responseJson = await fetchCredentialsFieldsByFolderId(
      $selectedFolder.id
    );
    credentialsFields = responseJson.data;
  });
  const toggleSelect = (e: any) => {
    selectedTab = e.detail;
  };

  let saveChanges;

  /*eslint-disable*/
</script>

<div
  class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex justify-end rounded-2xl border border-osvauld-activeBorder blur-none"
  in:fly
  out:fly
>
  <div
    class="w-[32.25rem] min-h-[34.375rem] max-h-[37rem] rounded-2xl translate-x-0 bg-osvauld-frameblack px-7 py-3 flex flex-col"
  >
    <div class="flex justify-between items-center p-3 pt-0">
      <span
        class="font-sans text-osvauld-quarzowhite text-xl font-normal flex justify-center items-center"
        >Share Folder <button
          class="ml-2"
          on:mouseenter={() => (infoOnHover = true)}
          on:mouseleave={() => (infoOnHover = false)}
          on:click={() => (showInfoTab = !showInfoTab)}
          ><InfoIcon color={infoOnHover ? "#BFC0CC" : "#4D4F60"} /></button
        ></span
      >

      <button class="p-2" on:click={() => showFolderShareDrawer.set(false)}
        ><ClosePanel /></button
      >
    </div>

    {#if showInfoTab}
      <div
        class="relative h-auto w-full px-4 py-2 mx-auto flex justify-start items-center rounded-lg cursor-pointer bg-osvauld-fieldActive"
        on:click={() => (infoDropdown = !infoDropdown)}
      >
        <span class="mr-2">
          <InfoIcon />
        </span>
        <p
          class="text-sm text-osvauld-sheffieldgrey font-normal {infoDropdown
            ? 'text-osvauld-highlightwhite'
            : ''}"
        >
          Select groups/users and choose access type
        </p>

        {#if infoDropdown}
          <InfoOverlay />
        {/if}
      </div>
    {/if}
    <div
      class="border-b mt-2 mb-4 border-osvauld-iconblack w-[calc(100%+3.5rem)] -translate-x-7"
    ></div>

    <div class="">
      <UserGroupToggle on:select={toggleSelect} />
      {#if selectedTab === "Users"}
        <ShareFolderWithUsers
          {users}
          {credentialsFields}
          bind:this={saveChanges}
          on:cancel={() => showFolderShareDrawer.set(false)}
          on:enable={(e) => (saveEnabled = e.detail)}
        />
      {:else}
        <ShareFolderWithGroups
          {credentialsFields}
          bind:this={saveChanges}
          on:cancel={() => showFolderShareDrawer.set(false)}
          on:enable={(e) => (saveEnabled = e.detail)}
        />
      {/if}
    </div>
    <div
      class="border-b mt-auto mb-2 border-osvauld-iconblack w-[calc(100%+3.5rem)] -translate-x-7"
    ></div>
    <div class="p-2 w-full flex justify-end items-center box-border mt-4">
      <button
        class="ml-auto p-2 whitespace-nowrap text-sm font-medium text-osvauld-fadedCancel"
        on:click={() => showFolderShareDrawer.set(false)}>Cancel</button
      >

      <button
        class="ml-4 px-3 py-2 whitespace-nowrap text-sm font-medium rounded-md {saveEnabled
          ? 'bg-osvauld-carolinablue text-osvauld-frameblack border-transparent'
          : 'border border-osvauld-iconblack text-osvauld-textActive'}"
        disabled={!saveEnabled}
        on:click={() => saveChanges.shareFolderHandler()}>Save changes</button
      >
    </div>
  </div>
</div>
