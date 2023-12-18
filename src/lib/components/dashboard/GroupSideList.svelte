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
  <button class=" bg-[#1E1B28] rounded-full p-2 pl-8 pr-8" on:click={openModal}
    >Add Group</button
  >
  {#if $showAddGroupDrawer}
    <button
      class="p-6 rounded shadow-lg"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <AddGroup on:close={closeModal} />
    </button>
  {/if}
  <ul>
    {#each $groupStore as group}
      <li
        class={` ${
          $selectedGroup === group
            ? "bg-[#282828] border border-[#333746] "
            : "hover:border hover:border-[#333746]"
        } rounded-md`}
      >
        <button
          on:click={() => selectGroup(group)}
          class={`p-2 text-lg rounded-2xl flex items-center cursor-pointer`}
        >
          {group.name}
        </button>
      </li>
    {/each}
  </ul>
</div>
