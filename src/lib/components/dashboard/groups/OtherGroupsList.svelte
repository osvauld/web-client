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
  <!-- <div
    class="h-[2.1rem] w-1/3 px-2 flex justify-start items-center border border-osvauld-iconblack rounded-lg cursor-pointer"
  >
    <Lens />
    <input
      type="text"
      class="h-[1.76rem] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
      placeholder="Search for group members.."
    />
  </div> -->
  {#if groupAdmin}
    <button
      class="rounded-md py-1 px-4 mr-2 bg-osvauld-carolinablue text-macchiato-surface0 flex justify-center items-center whitespace-nowrap xl:scale-90 lg:scale-95 md:scale-90 sm:scale-75"
      on:click={() => showAddUserToGroupDrawer.set(true)}
    >
      <span class="mr-1">Add new user</span>
      <Add />
    </button>
  {/if}
</div>
<div class="rounded my-6 px-10">
  <table class="min-w-max w-full table-auto table-layout-fixed">
    <thead>
      <tr class="leading-normal text-lg">
        <th class="py-3 px-3 text-left whitespace-nowrap w-1/5 pl-6">Name</th>
        <th class="py-3 px-3 text-left whitespace-nowrap w-1/3">Username</th>
        <th class="py-3 px-3 text-left whitespace-nowrap w-1/3">Access Type</th>
      </tr>
    </thead>
  </table>
  <div class="h-[40rem] overflow-y-auto scrollbar-thin px-2">
    {#if groupAdmin}
      <div class="flex justify-end items-center p-3">
        <button on:click={handleGroupRemoval}>
          <BinIcon />
        </button>
      </div>
    {/if}
    <table class="min-w-max w-full table-auto table-layout-fixed">
      <tbody class="text-xl text-osvauld-dusklabel font-normal text-sm">
        {#each $groupUsers as user}
          <tr class="border border-transparent hover:bg-osvauld-bordergreen">
            <td class="py-6 px-6 text-left whitespace-nowrap">
              {user.name}
            </td>
            <td class="py-6 px-6 text-left">
              {user.username}
            </td>

            <td class="py-6 px-6 text-left">
              {user.accessType}
            </td>
            <td
              class="flex justify-center items-center py-6 w-[4rem] cursor-pointer"
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
