<script lang="ts">
  import AddFolder from "./AddFolder.svelte";

  import {
    selectedCredential,
    showAddFolderDrawer,
    folderStore,
    selectedFolder,
    credentialStore,
  } from "../store";

  import browser from "webextension-polyfill";
  import { fetchCredentialsByFolder } from "../apis";

  import { Folder } from "../dtos";
  import Add from "../../basic/icons/add.svelte";

  let iconColor = "#6E7681"; //sheffieldgrey:

  const selectFolder = async (folder: Folder) => {
    selectedFolder.set(folder);
    selectedCredential.set(null);
    const responseJson = await fetchCredentialsByFolder(folder.id);

    const response = await browser.runtime.sendMessage({
      action: "decryptMeta",
      data: responseJson.data,
    });
    credentialStore.set(response.data);
  };

  const openModal = () => {
    showAddFolderDrawer.set(true);
  };

  const closeModal = () => {
    showAddFolderDrawer.set(false);
  };
</script>

<div>
  <button
    class="bg-osvauld-iconblack text-osvauld-sheffieldgrey hover:bg-osvauld-illutionpurple hover:text-osvauld-ninjablack whitespace-nowrap rounded-lg py-2 px-11 mb-4 flex justify-center items-center xl:scale-95 lg:scale-90 md:scale-75 sm:scale-50"
    on:mouseenter={() => (iconColor = "#000")}
    on:mouseleave={() => (iconColor = "#6E7681")}
    on:click={openModal}
    ><span class="mr-1">Create new folder</span>
    <Add color={iconColor} />
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
  <ul>
    {#each $folderStore as folder}
      <li
        class="{$selectedFolder?.id == folder.id
          ? 'bg-osvauld-bordergreen rounded-lg'
          : 'hover:bg-osvauld-bordergreen'} rounded-md my-0.5 pl-3"
      >
        <button
          on:click={() => selectFolder(folder)}
          class="w-full p-2 text-lg rounded-2xl flex items-center cursor-pointer"
        >
          {folder.name}
        </button>
      </li>
    {/each}
  </ul>
</div>
