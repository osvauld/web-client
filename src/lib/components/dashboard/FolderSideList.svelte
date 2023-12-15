<script lang="ts">
  import { folderStore, selectedFolder } from "../../store/folder.store";
  import { showAddFolderDrawer } from "../../store/ui.store";
  import { selectedCredential } from "../../store/credential.store";
  import { fetchCredentailsByFolder } from "../../apis/credentials.api";
  import AddFolder from "./AddFolder.svelte";
  const selectFolder = (folder) => {
    selectedFolder.set(folder);
    selectedCredential.set(null);
    fetchCredentailsByFolder(folder.id);
  };

  const openModal = () => {
    showAddFolderDrawer.set(true);
  };

  const closeModal = () => {
    showAddFolderDrawer.set(false);
  };
</script>

<div>
  <button class="bg-[#1E1B28] rounded-full p-2 pl-8 pr-8" on:click={openModal}
    >Add Folder
  </button>
  {#if $showAddFolderDrawer}
    <div
      class="bg-[#182034] fixed inset-0 flex items-center justify-center z-50"
      on:click={closeModal}
    >
      <div class="p-6 rounded shadow-lg" on:click|stopPropagation>
        <AddFolder on:close={closeModal} />
      </div>
    </div>
  {/if}
  <ul>
    {#each $folderStore as folder}
      <li
        class={` ${
          $selectedFolder === folder
            ? "bg-[#282828] border border-[#333746] "
            : "hover:border hover:border-[#333746]"
        } rounded-md`}
      >
        <button
          on:click={() => selectFolder(folder)}
          class={`p-2 text-lg rounded-2xl flex items-center cursor-pointer`}
        >
          {folder.name}
        </button>
      </li>
    {/each}
  </ul>
</div>
