<script lang="ts">
  import FolderEditor from "./FolderEditor.svelte";

  import {
    showAddFolderDrawer,
    folderStore,
    selectedFolder,
    buttonRef,
    showMoreOptions,
    modalManager,
    credentialStore,
    showFolderRenameDrawer,
  } from "../store";

  import { Folder } from "../dtos";
  import { Menu, FolderIcon, Add } from "../icons";
  import { onMount } from "svelte";
  import { setFolderStore } from "../../../store/storeHelper";
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
    buttonRef.set(e.currentTarget);
    modalManager.set({ id: folderId, name: folderName, type: "Folder" });
    showMoreOptions.set(true);
  };

  onMount(async () => {
    await setFolderStore();
  });
</script>

<div class="h-full w-full flex flex-col justify-start items-center">
  <button
    class="w-[90%] bg-osvauld-frameblack border border-osvauld-iconblack text-osvauld-sheffieldgrey hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack whitespace-nowrap rounded-lg py-1.5 px-2 mb-4 flex justify-center items-center"
    on:mouseenter={() => (iconColor = "#000")}
    on:mouseleave={() => (iconColor = "#6E7681")}
    on:click={openModal}
  >
    <span class="mr-1 text-base font-normal">Create new folder</span>
    <Add color={iconColor} />
  </button>
  {#if $showAddFolderDrawer || $showFolderRenameDrawer}
    <button
      class="fixed inset-0 flex items-center justify-center z-50 backdrop-filter backdrop-blur-[2px]"
      on:click={closeModal}
    >
      <button class="p-6 rounded" on:click|stopPropagation>
        <FolderEditor />
      </button>
    </button>
  {/if}
  <ul
    class="overflow-y-scroll w-full overflow-x-hidden scrollbar-thin h-full -pl-3"
  >
    {#each $folderStore as folder, index}
      <li
        class="{$selectedFolder?.id == folder.id
          ? 'bg-osvauld-fieldActive rounded-lg text-osvauld-sideListTextActive'
          : 'hover:bg-osvauld-fieldActive text-osvauld-fieldText'} rounded-md my-0.5 pl-3 pr-3 mr-1 flex items-center transition-colors duration-100"
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
            class="max-w-[75%] ml-2 text-base font-light overflow-hidden text-ellipsis whitespace-nowrap {$selectedFolder?.id ==
              folder.id || hoveringIndex === index
              ? 'text-osvauld-sideListTextActive'
              : 'text-osvauld-fieldText'}"
            >{folder.name}
            <span
              class="ml-2 text-osvauld-fieldText font-light {$selectedFolder?.id ===
              folder.id
                ? 'visible delay-200'
                : 'invisible'}">{$credentialStore.length}</span
            ></span
          >
          <div
            class="relative z-100 ml-auto flex justify-center items-center {$selectedFolder?.id ==
              folder.id || hoveringIndex === index
              ? 'visible'
              : 'invisible'}"
          >
            {#if folder.accessType === "manager"}
              <button
                class="p-2"
                on:click={(e) => {
                  openFolderMenu(e, folder.id, folder.name);
                }}
              >
                <Menu />
              </button>
            {/if}
          </div>
        </button>
      </li>
    {/each}
  </ul>
</div>
