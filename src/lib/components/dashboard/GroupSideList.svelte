<script>
  import { groupStore, selectedGroup } from "../../store/group.store";
  import { showAddGroupDrawer } from "../../store/ui.store";
  import AddGroup from "./AddGroup.svelte";

  const selectGroup = (group) => {
    selectedGroup.set(group);
  };
  const openModal = () => {
    showAddGroupDrawer.set(true);
  };

  const closeModal = () => {
    showAddGroupDrawer.set(false);
  };
</script>

<div>
  <button class="bg-blue-900 rounded-full p-2" on:click={openModal}
    >Add Group</button
  >
  {#if $showAddGroupDrawer}
    <div
      class="bg-[#182034] fixed inset-0 flex items-center justify-center z-50"
      on:click={closeModal}
    >
      <div class="p-6 rounded shadow-lg" on:click|stopPropagation>
        <AddGroup on:close={closeModal} />
      </div>
    </div>
  {/if}
  <ul>
    {#each $groupStore as group}
      <li class="list-none">
        <button
          on:click={() => selectGroup(group)}
          class={`p-2 text-lg rounded-2xl flex items-center cursor-pointer 
                        ${
                          $selectedGroup === group
                            ? "bg-blue-800 border border-blue-900 "
                            : "hover:border hover:border-blue-900"
                        }`}
        >
          {group.name}
        </button>
      </li>
    {/each}
  </ul>
</div>
