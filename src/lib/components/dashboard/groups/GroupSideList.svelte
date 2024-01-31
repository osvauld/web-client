<script lang="ts">
  import AddGroup from "./AddGroup.svelte";
  import {
    groupStore,
    selectedGroup,
    showAddGroupDrawer,
    showAddUserDrawer,
  } from "../store";
  import { Group } from "../dtos";
  import Add from '../../basic/add.svelte';

  const selectGroup = (group: Group) => {
    console.log('Group selected', group);
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
    class="bg-osvauld-illutionpurple whitespace-nowrap rounded-lg py-2 px-11 mb-4 flex justify-center items-center text-macchiato-base xl:scale-95 lg:scale-90 md:scale-75 sm:scale-50"
    on:click={() => openModal("group")}><span class="mr-1">Create new group</span> <Add/> </button
  >
  <!-- <button
    class="w-full bg-osvauld-grapegreen rounded-lg p-2 pl-8 pr-8 text-macchiato-crust flex justify-center items-center m-2"
    on:click={() => openModal("user")}>Add User <Add/> </button
  > -->
  {#if $showAddGroupDrawer}
    <button
      class="p-6 rounded shadow-lg"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <AddGroup on:close={closeModal} />
    </button>
  {/if}
  <ul class="mx-6 max-h-[40rem] overflow-y-scroll scrollbar-thin pr-3">
    {#each $groupStore as group}
      <li
        class="{
          $selectedGroup === group
            ? "bg-osvauld-bordergreen rounded-lg"
            : "hover:bg-osvauld-bordergreen"
        } rounded-md pl-3"
      >
        <button
          on:click={() => selectGroup(group)}
          class="w-full p-2 text-lg rounded-2xl flex items-center cursor-pointer "
        >
          {group.name}
        </button>
      </li>
    {/each}
  </ul>
</div>
