<script>
  import { folderStore, selectedFolder } from "../../store/folder.store.js";
  const selectFolder = (folder) => {
    selectedFolder.set(folder);
  };
</script>

<div>
  <ul>
    {#each $folderStore as folder}
      <li class="list-none">
        <button
          on:click={() => selectFolder(folder)}
          class={`p-2 text-lg rounded-2xl flex items-center cursor-pointer text-white
                        ${
                          $selectedFolder === folder
                            ? "bg-blue-800 border border-blue-900 text-white"
                            : "hover:border hover:border-blue-900"
                        }`}
        >
          {folder.name}
        </button>
      </li>
    {/each}
  </ul>
</div>
