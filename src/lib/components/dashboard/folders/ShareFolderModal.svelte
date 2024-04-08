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

  /*eslint-disable*/
</script>

<div
  class="fixed top-[7.6rem] right-[30rem] z-50 flex justify-end rounded-xl border border-osvauld-activeBorder blur-none"
  in:fly
  out:fly
>
  <div
    class="w-[32.25rem] min-h-[68vh] max-h-[82vh] rounded-2xl translate-x-0 bg-osvauld-frameblack p-6"
  >
    <div class="flex justify-between items-center p-3">
      <span class="font-sans text-osvauld-quarzowhite text-28 font-normal"
        >Share Folder</span
      >
      <button class="p-2" on:click={() => showFolderShareDrawer.set(false)}
        ><ClosePanel /></button
      >
    </div>
    <div
      class="relative h-auto w-full px-4 py-2 mx-auto flex justify-between items-center rounded-lg cursor-pointer mb-3 bg-osvauld-fieldActive"
      on:click={() => (infoDropdown = !infoDropdown)}
    >
      <p
        class="text-sm text-osvauld-sheffieldgrey font-normal {infoDropdown
          ? 'text-osvauld-highlightwhite'
          : ''}"
      >
        Select groups/users and choose access type
      </p>

      <span class="">
        <InfoIcon />
      </span>
      {#if infoDropdown}
        <InfoOverlay />
      {/if}
    </div>

    <div class="flex-grow max-h-[85vh]">
      <UserGroupToggle on:select={toggleSelect} />
      {#if selectedTab === "Users"}
        <ShareFolderWithUsers
          {users}
          {credentialsFields}
          on:cancel={() => showFolderShareDrawer.set(false)}
        />
      {:else}
        <ShareFolderWithGroups
          {credentialsFields}
          on:cancel={() => showFolderShareDrawer.set(false)}
        />
      {/if}
    </div>
  </div>
</div>
