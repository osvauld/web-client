<script lang="ts">
  import AddFolder from "./AddFolder.svelte";

  import {
    selectedCredential,
    showAddFolderDrawer,
    folderStore,
    selectedFolder,
    credentialStore,
  } from "../store";

  import { fetchCredentialsByFolder, fetchAllFolders } from "../apis";

  import { Folder } from "../dtos";
  import Add from "../../basic/icons/add.svelte";
  import FolderIcon from "../../basic/icons/folderIcon.svelte";
  import { sendMessage } from "../helper";
  import { on } from "events";
  import { onMount } from "svelte";

  let iconColor = "#6E7681"; //sheffieldgrey:

  const selectFolder = async (folder: Folder) => {
    selectedFolder.set(folder);
    selectedCredential.set(null);
    const responseJson = await fetchCredentialsByFolder(folder.id);

    const response = await sendMessage("decryptMeta", responseJson.data);
    credentialStore.set(response.data);
  };

  const openModal = () => {
    showAddFolderDrawer.set(true);
  };

  const closeModal = () => {
    showAddFolderDrawer.set(false);
  };

  onMount(async () => {
    const responseJson = await fetchAllFolders();
    folderStore.set(responseJson.data);
  });
</script>

<div>
  <button
    class="bg-osvauld-frameblack border border-osvauld-iconblack text-osvauld-sheffieldgrey hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack whitespace-nowrap rounded-lg py-2 px-14 mb-4 flex justify-center items-center xl:scale-95"
    on:mouseenter={() => (iconColor = "#000")}
    on:mouseleave={() => (iconColor = "#6E7681")}
    on:click={openModal}
  >
    <Add color={iconColor} />
    <span class="ml-1">Create new folder</span>
  </button>
  {#if $showAddFolderDrawer}
    <button
      class="fixed inset-0 flex items-center justify-center z-50 backdrop-filter backdrop-blur-[2px]"
      on:click={closeModal}
    >
      <button class="p-6 rounded" on:click|stopPropagation>
        <AddFolder />
      </button>
    </button>
  {/if}
  <ul class="xl:scale-95">
    {#each $folderStore as folder}
      <li
        class="{$selectedFolder?.id == folder.id
          ? 'bg-osvauld-bordergreen rounded-lg text-osvauld-plainwhite'
          : 'hover:bg-osvauld-bordergreen text-osvauld-quarzowhite'} rounded-md my-0.5 pl-3"
      >
        <button
          on:click={() => selectFolder(folder)}
          class="w-full p-2 text-lg rounded-2xl flex items-center cursor-pointer"
        >
          <FolderIcon
            color={$selectedFolder?.id == folder.id ? "white" : "#85889C"}
          />
          <span class="ml-2">{folder.name}</span>
        </button>
      </li>
    {/each}
  </ul>
</div>
