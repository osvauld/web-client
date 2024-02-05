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
  import Add from "../../basic/add.svelte";

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
    class="bg-osvauld-illutionpurple whitespace-nowrap rounded-lg py-2 px-11 mb-4 flex justify-center items-center text-macchiato-base xl:scale-95 lg:scale-90 md:scale-75 sm:scale-50"
    on:click={openModal}
    ><span class="mr-1">Create new folder</span>
    <Add />
  </button>
  {#if $showAddFolderDrawer}
    <button
      class="fixed inset-0 flex items-center justify-center z-50 bg-[#010409ad] backdrop-filter backdrop-blur-[2px]"
      on:click={closeModal}
    >
      <button class="p-6 rounded " on:click|stopPropagation>
        <AddFolder />
      </button>
    </button>
  {/if}
  <ul>
    {#each $folderStore as folder}
      <button
        on:click={() => selectFolder(folder)}
        class={`p-2 w-full text-lg rounded-2xl flex items-center cursor-pointer ${
          $selectedFolder === folder
            ? "bg-osvauld-cretangreen border border-osvauld-cretangreen text-macchiato-crust"
            : "hover:border hover:border-macchiato-teal text-macchiato-subtext1 "
        } rounded-md`}
      >
        {folder.name}
      </button>
    {/each}
  </ul>
</div>
