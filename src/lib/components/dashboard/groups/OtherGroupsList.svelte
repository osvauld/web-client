<script lang="ts">
  import { Lens, Add, BinIcon } from "../icons";
  import {
    groupUsers,
    selectedGroup,
    groupStore,
    showAddUserToGroupDrawer,
  } from "../store";
  import {
    removeUserFromGroup,
    fetchAllUserGroups,
    removeGroup,
  } from "../apis";
  import { onMount, onDestroy } from "svelte";
  import { setbackground } from "../helper";
  export let groupName;
  const handleRemoveUserFromGroup = async (userId) => {
    await removeUserFromGroup($selectedGroup.groupId, userId);
    selectedGroup.set($selectedGroup);
  };
  const handleGroupRemoval = async () => {
    await removeGroup($selectedGroup.groupId);
    selectedGroup.set(null);
    const responseJson = await fetchAllUserGroups();
    groupStore.set(responseJson.data);
  };
  let user;
  let groupAdmin = false;
  let unsubscribe;
  onMount(() => {
    unsubscribe = selectedGroup.subscribe((value) => {
      if (value === null) return;
      groupAdmin = value.accessType === "admin";
    });
  });
  onDestroy(() => {
    unsubscribe();
  });
</script>

<div class="flex items-center justify-between px-4 py-5 pb-0">
  <h1 class="text-4xl p-4 font-normal w-1/3 ml-3">{groupName}</h1>
  {#if groupAdmin}
    <button
      class="rounded-md py-1 px-4 mr-2 border border-osvauld-iconblack flex justify-center items-center whitespace-nowrap text-base font-light text-osvauld-textActive"
      on:click={() => showAddUserToGroupDrawer.set(true)}
    >
      <span class="mr-1">Add new user</span>
      <Add color={"#85889C"} />
    </button>
  {/if}
</div>
<div class="rounded my-6 px-10">
  <table class="min-w-max w-full table-auto table-layout-fixed">
    <thead>
      <tr
        class="leading-normal text-base font-light text-osvauld-fieldTextActive"
      >
        <th class="py-3 px-3 text-left whitespace-nowrap w-1/4">Name</th>
        <th class="py-3 px-3 text-left whitespace-nowrap w-1/4">Username</th>
        <th class="py-3 px-3 text-left whitespace-nowrap w-1/4">Role</th>
        <th class="py-3 px-3 text-left whitespace-nowrap w-1/4"></th>
      </tr>
    </thead>
  </table>
  <div class="h-[40rem] overflow-y-auto scrollbar-thin px-2">
    {#if groupAdmin}
      <div class="flex justify-end items-center p-3">
        <button on:click={handleGroupRemoval}> <BinIcon /> </button>
      </div>
    {/if}
    <table class="min-w-max w-full table-auto table-layout-fixed">
      <tbody class="text-xlfont-normal text-sm">
        {#each $groupUsers as user}
          <tr
            class="border border-transparent hover:bg-osvauld-modalFieldActive text-osvauld-dusklabel hover:text-osvauld-sideListTextActive text-base font-light border-b border-b-osvauld-iconblack
            transition-colors duration-300"
          >
            <td class="py-5 px-6 text-left whitespace-nowrap w-1/4">
              {user.name}
            </td>
            <td class="py-5 px-6 text-left w-1/4">
              {user.username}
            </td>
            <td class="py-5 px-6 text-left w-1/4">
              <span
                class="inline-block w-[70%] px-4 py-1 rounded-md text-center {user.accessType ===
                'admin'
                  ? 'bg-osvauld-ownerGreen text-osvauld-ownerText'
                  : 'bg-osvauld-readerOrange text-osvauld-readerText'}"
              >
                {user.accessType}
              </span>
            </td>
            <td
              class="flex justify-center items-center py-5 w-1/4 cursor-pointer"
            >
              {#if groupAdmin}
                <button on:click={() => handleRemoveUserFromGroup(user.id)}>
                  <BinIcon />
                </button>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
