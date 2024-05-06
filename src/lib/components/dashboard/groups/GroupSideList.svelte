<script lang="ts">
  import AddGroup from "./AddGroup.svelte";
  import {
    groupStore,
    selectedGroup,
    showAddGroupDrawer,
    showAddUserDrawer,
    allUsersSelected,
    showMoreGroupOptions,
    buttonRef,
    modalManager,
  } from "../store";
  import { Group } from "../dtos";
  import { fade, scale } from "svelte/transition";

  import Add from "../../basic/icons/add.svelte";
  import { GroupIcon, Menu } from "../icons";
  import { onMount } from "svelte";
  import { setGroupStore } from "../../../store/storeHelper";
  const accountDetails = localStorage.getItem("user");
  let accountRole = JSON.parse(accountDetails).type;
  let adminStatus = false;
  let hoveringIndex = null;
  if (accountRole === "admin") {
    adminStatus = true;
  }
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

  const showMoreOptionsHandler = (e, group) => {
    buttonRef.set(e.target);
    modalManager.set({ id: group.groupId, name: group.name, type: "Group" });
    showMoreGroupOptions.set(true);
  };
  onMount(async () => {
    await setGroupStore();
  });
</script>

<div class="h-full flex w-full flex-col justify-start items-center">
  <button
    class="w-[90%] bg-osvauld-frameblack border border-osvauld-iconblack text-osvauld-sheffieldgrey hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack whitespace-nowrap rounded-lg py-1.5 px-2 mb-4 flex justify-center items-center font-normal"
    on:mouseenter={() => (iconColor = "#000")}
    on:mouseleave={() => (iconColor = "#6E7681")}
    on:click={() => openModal("group")}
  >
    <span class="mr-1 text-base font-normal">Create new group</span>
    <Add color={iconColor} />
  </button>
  {#if $showAddGroupDrawer}
    <button
      class="fixed inset-0 flex items-center justify-center z-50 backdrop-filter backdrop-blur-[2px]"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <AddGroup on:close={closeModal} />
    </button>
  {/if}
  <ul
    class="h-full w-full overflow-y-scroll overflow-x-hidden scrollbar-thin -pl-3"
  >
    {#if adminStatus}
      <li
        class="{$allUsersSelected || hoveringIndex === 999
          ? 'bg-osvauld-fieldActive text-osvauld-sideListTextActive'
          : 'hover:bg-osvauld-fieldActive text-osvauld-fieldText'} rounded-md pl-3 my-0.5 mr-1 pr-3 flex items-center"
        on:mouseenter={() => (hoveringIndex = 999)}
        on:mouseleave={() => (hoveringIndex = null)}
      >
        <button
          on:click={() => selectingAllUsers()}
          class="w-full p-2 text-lg rounded-2xl flex items-center cursor-pointer"
        >
          <GroupIcon
            color={$allUsersSelected || hoveringIndex === 999
              ? "white"
              : "#85889C"}
          />
          <span class="ml-2 text-base font-light">All users</span>
        </button>
      </li>
    {/if}
    {#each $groupStore as group, index}
      <li
        class="{($selectedGroup && $selectedGroup.groupId === group.groupId) ||
        hoveringIndex === index
          ? 'bg-osvauld-fieldActive text-osvauld-sideListTextActive'
          : 'hover:bg-osvauld-fieldActive text-osvauld-fieldText'} rounded-md pl-3 my-0.5 pr-3 mr-1 flex items-center transition-colors duration-100"
        on:mouseenter={() => (hoveringIndex = index)}
        on:mouseleave={() => (hoveringIndex = null)}
      >
        <button
          on:click={() => selectGroup(group)}
          class="w-full p-2 text-lg rounded-2xl flex items-center cursor-pointer"
        >
          <GroupIcon
            color={($selectedGroup &&
              $selectedGroup.groupId === group.groupId) ||
            hoveringIndex === index
              ? "white"
              : "#85889C"}
          />
          <span
            class="ml-2 text-base font-light overflow-hidden text-ellipsis whitespace-nowrap"
            >{group.name}</span
          >
        </button>
        <div
          class="relative z-100 flex justify-center items-center {($selectedGroup &&
            $selectedGroup.groupId === group.groupId) ||
          hoveringIndex === index
            ? 'visible'
            : 'hidden'}"
        >
          {#if group.accessType === "admin"}
            <button
              class="p-2"
              on:click|preventDefault={(e) => {
                showMoreOptionsHandler(e, group);
              }}
            >
              <Menu />
            </button>
          {/if}
        </div>
      </li>
    {/each}
  </ul>
</div>
