<script lang="ts">
  import AddGroup from "./AddGroup.svelte";
  import {
    groupStore,
    selectedGroup,
    showAddGroupDrawer,
    showAddUserDrawer,
  } from "../store";
  import { Group } from "../dtos";

  const selectGroup = (group: Group) => {
    selectedGroup.set(group);
  };

  const openModal = (type: string) => {
    if (type === "group") {
      showAddGroupDrawer.set(true);
    } else if (type === "user") {
      showAddUserDrawer.set(true);
    }
  };

  const closeModal = () => {
    showAddGroupDrawer.set(false);
  };
</script>

<div>
  <button
    class=" bg-macchiato-maroon rounded-full p-2 pl-8 pr-8 text-macchiato-crust"
    on:click={() => openModal("group")}>Add Group</button
  >
  <button
    class=" bg-macchiato-pink rounded-full p-2 pl-8 pr-8 text-macchiato-crust"
    on:click={() => openModal("user")}>Add User</button
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
