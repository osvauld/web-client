<script lang="ts">
  import { selectedPage } from "../../store/ui.store";
  import { groupStore, selectedGroup } from "../../store/group.store";
  import { selectedFolder } from "../../store/folder.store";
  import { fetchAllFolders } from "../../apis/folder.api";
  import { fetchAllUserGroups } from "../../apis/group.api";
  import { folderStore } from "../../store/folder.store";
  import MultipleFolders from "./icons/multipleFolders.svelte";
  import GroupIcon from "./icons/groupIcon.svelte";
  const select = async (choice: string) => {
    if (choice === "Folders") {
      const responseJson = await fetchAllFolders();
      folderStore.set(responseJson.data);
    } else {
      const responseJson = await fetchAllUserGroups();
      groupStore.set(responseJson.data);
    }
    selectedPage.set(choice);
    selectedGroup.set(null);
    selectedFolder.set(null);
  };
</script>

<div class="flex justify-center">
  <div
    class="inline-flex justify-center space-x-1 p-1 bg-osvauld-frameblack border border-osvauld-iconblack rounded-xl xl:scale-95 lg:scale-90 md:scale-75 sm:scale-50"
  >
    {#each ["Folders", "Groups"] as item}
      <button
        class="w-1/2 px-6 py-2 text-lg flex justify-center items-center rounded-lg focus:outline-none {$selectedPage ===
        item
          ? 'bg-osvauld-bordergreen text-osvauld-plainwhite'
          : 'text-osvauld-quarzowhite'} "
        on:click={() => select(item)}
      >
        {#if item === "Folders"}
          <MultipleFolders
            color={$selectedPage === "Folders" ? "white" : "#85889C"}
          />
        {:else}
          <GroupIcon color={$selectedPage === item ? "white" : "#85889C"} />
        {/if}
        <span class="ml-2">{item}</span>
      </button>
    {/each}
  </div>
</div>
