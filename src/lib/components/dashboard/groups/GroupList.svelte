<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Unsubscriber} from "svelte/store";

  import {
    selectedGroup,
    showAddUserDrawer,
    showAddUserToGroupDrawer,
    allUsersSelected,
    adminStatus
  } from "../store";

  import AddUser from "./AddUser.svelte";
  import AddUserToGroup from "./AddUserToGroup.svelte";

  import { User } from "../dtos";

  import { fetchGroupUsers, fetchAllUsers } from "../apis";
  import AllUsersList from './AllUsersList.svelte';
  import OtherGroupsList from './OtherGroupsList.svelte';

  let groupUsers: User[] = [];
  let unsubscribe: Unsubscriber;
  let groupName =""
  let allUsers: User[] = [];

  onMount(() => {
    unsubscribe = selectedGroup.subscribe((value) => {
      if (value) {
        groupName = value.name
        fetchGroupUsers(value.groupId).then((usersResponse) => {
          groupUsers = usersResponse.data;
        });
      }
    });
    if(adminStatus){
      fetchAllUsers().then((usersResponse) => {
        allUsers = usersResponse.data
      });
    }
  });
  onDestroy(() => {
    unsubscribe();
    groupUsers = [];
  });



</script>

<div class="z-50 ">
  {#if $showAddUserDrawer || $showAddUserToGroupDrawer}
    <div class="fixed z-10 inset-0 overflow-y-auto">
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-[#010409ad] backdrop-filter backdrop-blur-[2px]"></div>
        </div>

        <span
          class="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true">&#8203;</span
        >

        <div
          class="inline-flex justify-center items-center align-bottom rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        >
          {#if $showAddUserDrawer}
            <AddUser />
          {:else if $showAddUserToGroupDrawer}
            <AddUserToGroup />
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

  <div class="min-w-screen h-[48rem] flex overflow-hidden ">
    <div class="w-full">
      {#if adminStatus && $allUsersSelected}
          <AllUsersList {allUsers}/>
      {:else if $selectedGroup}
          <OtherGroupsList {groupUsers} {groupName}/>
      {/if}
    </div>
  </div>