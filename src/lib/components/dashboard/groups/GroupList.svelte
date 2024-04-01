<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Unsubscriber } from "svelte/store";

  import {
    selectedGroup,
    showAddUserToGroupDrawer,
    allUsersSelected,
    adminStatus,
  } from "../store";

  import AddUserToGroup from "./AddUserToGroup.svelte";

  import { User } from "../dtos";
  import { groupUsers } from "../store";
  import { fetchGroupUsers, fetchAllUsers } from "../apis";
  import AllUsersList from "./AllUsersList.svelte";
  import OtherGroupsList from "./OtherGroupsList.svelte";

  let unsubscribe: Unsubscriber;
  let groupName = "";
  let allUsers: User[] = [];

  onMount(() => {
    unsubscribe = selectedGroup.subscribe((value) => {
      if (value) {
        groupName = value.name;
        fetchGroupUsers(value.groupId).then((usersResponse) => {
          groupUsers.set(usersResponse.data);
        });
      }
    });
    if (adminStatus) {
      fetchAllUsers().then((usersResponse) => {
        allUsers = usersResponse.data;
      });
    }
  });
  onDestroy(() => {
    unsubscribe();
    groupUsers.set([]);
  });
</script>

<div class="z-50">
  {#if $showAddUserToGroupDrawer}
    <button
      class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
      on:click={() => {}}
    >
      <button class="p-6 rounded bg-transparent" on:click|stopPropagation>
        <AddUserToGroup />
      </button>
    </button>
  {/if}
</div>

<div class="min-w-screen h-[48rem] flex overflow-">
  <div class="w-full">
    {#if adminStatus && $allUsersSelected}
      <AllUsersList {allUsers} />
    {:else if $selectedGroup}
      <OtherGroupsList {groupName} />
    {/if}
  </div>
</div>
