<script lang="ts">
  import AddFolder from "./AddFolder.svelte";
  import FolderDeleteModal from "./FolderDeleteModal.svelte";
  import {
    showAddFolderDrawer,
    folderStore,
    selectedFolder,
    buttonRef,
    showFolderMenu,
    menuForFolder,
    folderDeleteModal,
    folderOfInterest,
  } from "../store";

  import { fetchAllFolders } from "../apis";
  import { Folder } from "../dtos";
  import { Menu, FolderIcon, Add } from "../icons";
  import { onMount } from "svelte";
  let iconColor = "#6E7681";
  let hoveringIndex = null;
  const selectFolder = async (folder: Folder) => {
    selectedFolder.set(folder);
  };

  const openModal = () => {
    showAddFolderDrawer.set(true);
  };

  const closeModal = () => {
    showAddFolderDrawer.set(false);
  };

  const openFolderMenu = (e, folderId: string, folderName: string) => {
    folderOfInterest.set(folderName);
    showFolderMenu.set(true);
    buttonRef.set(e.currentTarget);
    menuForFolder.set(folderId);
  };
  onMount(async () => {
    const responseJson = await fetchAllFolders();
    folderStore.set(responseJson.data);
  });
</script>

{#if $folderDeleteModal}
  <FolderDeleteModal />
{/if}
<div>
  <button
    class="bg-osvauld-frameblack border border-osvauld-iconblack text-osvauld-sheffieldgrey hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack whitespace-nowrap rounded-lg py-2 px-10 mb-4 flex justify-center items-center"
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
  <ul class="">
    {#each $folderStore as folder, index}
      <li
        class="{$selectedFolder?.id == folder.id
          ? 'bg-osvauld-bordergreen rounded-lg text-osvauld-sideListTextActive'
          : 'hover:bg-osvauld-bordergreen text-osvauld-fieldText'} rounded-md my-0.5 pl-3 pr-3 flex items-center"
        on:mouseenter={() => (hoveringIndex = index)}
        on:mouseleave={() => (hoveringIndex = null)}
      >
        <button
          on:click={() => selectFolder(folder)}
          class="w-full p-2 text-lg rounded-2xl flex items-center cursor-pointer"
        >
          <FolderIcon
            color={$selectedFolder?.id == folder.id || hoveringIndex === index
              ? "#F2F2F0"
              : "#85889C"}
          />
          <span
            class="ml-2 text-base font-light {$selectedFolder?.id ==
              folder.id || hoveringIndex === index
              ? 'text-osvauld-sideListTextActive'
              : 'text-osvauld-fieldText'}">{folder.name}</span
          >
        </button>
        <div
          class="relative z-100 flex justify-center items-center {$selectedFolder?.id ==
            folder.id || hoveringIndex === index
            ? 'visible'
            : 'invisible'}"
        >
          <button
            class="p-2"
            on:click={(e) => {
              openFolderMenu(e, folder.id, folder.name);
            }}
          >
            <Menu />
          </button>
        </div>
      </li>
    {/each}
  </ul>
</div>
