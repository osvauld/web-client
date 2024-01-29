<script lang="ts">
  import { selectedPage } from "../../store/ui.store";
  import { selectedGroup } from "../../store/group.store";
  import { selectedFolder } from "../../store/folder.store";
  import { fetchAllFolders } from "../../apis/folder.api";
  import { fetchAllUserGroups } from "../../apis/group.api";
  import { folderStore } from "../../store/folder.store";
  const select = async (choice: string) => {
    if (choice === "Credentials") {
      const responseJson = await fetchAllFolders();
      folderStore.set(responseJson.data);
    } else {
      fetchAllUserGroups();
    }
    selectedPage.set(choice);
    selectedGroup.set(null);
    selectedFolder.set(null);
  };
</script>

<div class="flex justify-center">
  <div
    class="inline-flex justify-center space-x-1 p-1 bg-osvauld-frameblack border-2 border-osvauld-bordergreen rounded-xl xl:scale-95 lg:scale-90 md:scale-75 sm:scale-50"
  >
    {#each ["Credentials", "Groups"] as item}
      <button
        class="w-1/2 px-6 py-2 text-lg flex justify-center items-center rounded-lg focus:outline-none {$selectedPage ===
        item
          ? 'bg-osvauld-lilacpink text-osvauld-ninjablack'
          : 'text-osvauld-quarzowhite'} "
        on:click={() => select(item)}
      >
        {item}
      </button>
    {/each}
  </div>
</div>
