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
  import { fetchAllUserGroups } from "../apis";
  import { Group } from "../dtos";
  import Add from "../../basic/icons/add.svelte";
  import { GroupIcon } from "../icons";
  import { onMount } from "svelte";

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
    selectedGroup.set(null);
    allUsersSelected.set(true);
  };
  onMount(async () => {
    const responseJson = await fetchAllUserGroups();
    groupStore.set(responseJson.data);
  });
</script>

<div>
  <button
    class="bg-osvauld-frameblack border border-osvauld-iconblack text-osvauld-sheffieldgrey hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack whitespace-nowrap rounded-lg py-2 px-10 mb-4 flex justify-center items-center"
    on:mouseenter={() => (iconColor = "#000")}
    on:mouseleave={() => (iconColor = "#6E7681")}
    on:click={() => openModal("group")}
  >
    <Add color={iconColor} />
    <span class="ml-1">Create new group</span>
  </button>
  {#if $showAddGroupDrawer}
    <button
      class="fixed inset-0 flex items-center justify-center z-50 bg- backdrop-filter backdrop-blur-[2px]"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <AddGroup on:close={closeModal} />
    </button>
  {/if}
  <ul class=" max-h-[40rem] overflow-y-scroll scrollbar-thin -pl-3 xl:scale-95">
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
          <GroupIcon color={$allUsersSelected ? "white" : "#85889C"} />
          <span class="ml-2">All users</span>
        </button>
      </li>
    {/if}
    {#each $groupStore as group}
      <li
        class="{$selectedGroup && $selectedGroup.groupId === group.groupId
          ? 'bg-osvauld-bordergreen rounded-lg text-osvauld-plainwhite'
          : 'hover:bg-osvauld-bordergreen text-osvauld-quarzowhite'} rounded-md pl-3 my-0.5"
      >
        <button
          on:click={() => selectGroup(group)}
          class="w-full p-2 text-lg rounded-2xl flex items-center cursor-pointer"
        >
          <GroupIcon
            color={$selectedGroup && $selectedGroup.groupId === group.groupId
              ? "white"
              : "#85889C"}
          />
          <span class="ml-2">{group.name}</span>
        </button>
      </li>
    {/each}
  </ul>
</div>
