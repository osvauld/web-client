<script>
  import { folderStore, selectedFolder } from "../../store/folder.store";
  import { fetchSecretsByFolder } from "../../apis/secrets.api";
  const selectFolder = (folder) => {
    selectedFolder.set(folder);
    fetchSecretsByFolder(folder.id);
  };
</script>

<div>
  <ul>
    {#each $folderStore as folder}
      <li class="list-none">
        <button
          on:click={() => selectFolder(folder)}
          class={`p-2 text-lg rounded-2xl flex items-center cursor-pointer
                        ${
                          $selectedFolder === folder
                            ? "bg-blue-800 border border-blue-900 "
                            : "hover:border hover:border-blue-900"
                        }`}
        >
          {folder.name}
        </button>
      </li>
    {/each}
  </ul>
</div>
