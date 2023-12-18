<script lang="ts">
  import { folderStore, selectedFolder } from "../../store/folder.store";
  import { showAddFolderDrawer } from "../../store/ui.store";
  import { selectedCredential } from "../../store/credential.store";
  import { fetchCredentailsByFolder } from "../../apis/credentials.api";
  import { theme } from "../../apis/temp";
  import AddFolder from "./AddFolder.svelte";
  import { Folder } from "../../dtos/folder.dto";
  const selectFolder = (folder: Folder) => {
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
  <button
    class="bg-macchiato-red rounded-full p-2 pl-8 pr-8"
    on:click={openModal}
    >Add Folder
  </button>
  {#if $showAddFolderDrawer}
    <button
      class="bg-[#182034] fixed inset-0 flex items-center justify-center z-50"
      on:click={closeModal}
    >
      <button class="p-6 rounded shadow-lg" on:click|stopPropagation>
        <AddFolder on:close={closeModal} />
      </button>
    </button>
  {/if}
  <ul>
    {#each $folderStore as folder}
      <li
        class={` ${
          $selectedFolder === folder
            ? "bg-macchiato-rosewater border border-macchiato-flamingo "
            : "hover:border hover:border-macchiato-teal "
        } rounded-md`}
      >
        <button
          on:click={() => selectFolder(folder)}
          class={`p-2 text-lg rounded-2xl flex items-center cursor-pointer text-macchiato-subtext1`}
        >
          {folder.name}
        </button>
      </li>
    {/each}
  </ul>
</div>
