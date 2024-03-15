<script lang="ts">
  import AddGroup from "./AddGroup.svelte";
  import {
    groupStore,
    selectedGroup,
    showAddGroupDrawer,
    showAddUserDrawer,
    allUsersSelected,
    adminStatus,
  } from "../store";
  import { Group } from "../dtos";
  import Add from "../../basic/icons/add.svelte";

  let iconColor = "#6E7681"; //sheffieldgrey:

  const selectGroup = (group: Group) => {
    allUsersSelected.set(false);
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

  const selectingAllUsers = () => {
    $selectedGroup = null;
    allUsersSelected.set(true);
  };
</script>

<div>
  <button
    class="bg-osvauld-iconblack text-osvauld-sheffieldgrey hover:bg-osvauld-illutionpurple hover:text-osvauld-ninjablack whitespace-nowrap rounded-lg py-2 px-11 mb-4 flex justify-center items-center xl:scale-95 lg:scale-90 md:scale-75 sm:scale-50"
    on:mouseenter={() => (iconColor = "#000")}
    on:mouseleave={() => (iconColor = "#6E7681")}
    on:click={() => openModal("group")}
    ><span class="mr-1">Create new group</span>
    <Add color={iconColor} /></button
  >
  {#if $showAddGroupDrawer}
    <button
      class="fixed inset-0 flex items-center justify-center z-50 bg- backdrop-filter backdrop-blur-[2px]"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <AddGroup on:close={closeModal} />
    </button>
  {/if}
  <ul class="mx-6 max-h-[40rem] overflow-y-scroll scrollbar-thin pr-3">
    {#if adminStatus}
      <li
        class="{$allUsersSelected
          ? 'bg-osvauld-bordergreen rounded-lg'
          : 'hover:bg-osvauld-bordergreen'} rounded-md pl-3"
      >
        <button
          on:click={() => selectingAllUsers()}
          class="w-full p-2 text-lg rounded-2xl flex items-center cursor-pointer"
        >
          All users
        </button>
      </li>
    {/if}
    {#each $groupStore as group}
      <li
        class="{$selectedGroup === group
          ? 'bg-osvauld-bordergreen rounded-lg'
          : 'hover:bg-osvauld-bordergreen'} rounded-md pl-3"
      >
        <button
          on:click={() => selectGroup(group)}
          class="w-full p-2 text-lg rounded-2xl flex items-center cursor-pointer"
        >
          {group.name}
        </button>
      </li>
    {/each}
  </ul>
</div>
