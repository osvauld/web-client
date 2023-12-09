<script>
  import { selectedPage } from "../../store/ui.store";
  import { selectedGroup } from "../../store/group.store";
  import { selectedFolder } from "../../store/folder.store";
  import { fetchAllFolders } from "../../apis/folder.api";
  import { fetchAllUserGroups } from "../../apis/group.api";
  function select(choice) {
    if (choice === "Secrets") {
      fetchAllFolders();
    } else {
      fetchAllUserGroups();
    }
    selectedPage.set(choice);
    selectedGroup.set(null);
    selectedFolder.set(null);
  }
</script>

<div class="flex justify-center">
  <div
    class="inline-flex justify-center space-x-1 bg-[#182034] p-2 rounded-full"
  >
    {#each ["Secrets", "Groups"] as item}
      <button
        class="px-4 py-2 rounded-full focus:outline-none {$selectedPage === item
          ? 'bg-[#262c44]'
          : 'bg-[#182034]'}"
        on:click={() => select(item)}
      >
        {item}
      </button>
    {/each}
  </div>
</div>
