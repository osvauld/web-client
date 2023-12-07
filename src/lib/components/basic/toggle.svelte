<script>
  import { selectedPage } from "../../store/ui.ts";
  import { fetchAllFolders } from "../../apis/folder.ts";
  import { fetchAllUserGroups } from "../../apis/group.ts";
  function select(choice) {
    if (choice === "Secrets") {
      fetchAllFolders();
    } else {
      fetchAllUserGroups();
    }
    selectedPage.set(choice);
  }
</script>

<div class="flex justify-center">
  <div
    class="inline-flex justify-center space-x-1 bg-[#182034] p-2 rounded-full"
  >
    {#each ["Secrets", "Groups"] as item}
      <button
        class="px-4 py-2 rounded-full focus:outline-none text-white {$selectedPage ===
        item
          ? 'bg-[#262c44]'
          : 'bg-[#182034]'}"
        on:click={() => select(item)}
      >
        {item}
      </button>
    {/each}
  </div>
</div>
