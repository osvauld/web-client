<script lang="ts">
  import { onMount, onDestroy } from "svelte";
<<<<<<< HEAD
  import { Unsubscriber} from "svelte/store";
=======
  import { Unsubscriber, writable } from "svelte/store";
>>>>>>> f0817b9 (working list top search and btns progress)

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

  import { fetchGroupUsers } from "../apis";
  import { fetchAllUsers } from "../apis"
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
  });

  onDestroy(() => {
    unsubscribe();
    groupUsers = [];
  });

  if(adminStatus){
      fetchAllUsers().then((usersResponse) => {
        allUsers = usersResponse.data
      });
  }

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

<<<<<<< HEAD
  <div class="min-w-screen h-[48rem] flex overflow-hidden ">
    <div class="w-full">
      {#if adminStatus && $allUsersSelected}
          <AllUsersList {allUsers}/>
      {:else if $selectedGroup}
          <OtherGroupsList {groupUsers} {groupName}/>
      {/if}
=======
  <div class="min-w-screen min-h-screen flex overflow-auto border rounded-2xl border-osvauld-iconblack">
    <div class="w-full">
      <div class="flex items-center px-4 py-2">
        <h1 class="text-4xl p-4 font-normal w-1/3">{$groupName}</h1>
        <div
          class="h-[2.1rem] w-1/4 px-2 mx-auto flex justify-start items-center border border-osvauld-iconblack rounded-lg cursor-pointer"
        >
          <Lens />
          <input
            type="text"
            class="h-[1.76rem] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
            placeholder="Search for group members.."
          />
        </div>
        {#if !selectedAllUsers}
        <button
            class="bg rounded-md py-1 px-4 mr-2 bg-osvauld-carolinablue text-macchiato-surface0 flex justify-center items-center whitespace-nowrap xl:scale-90 lg:scale-95 md:scale-90 sm:scale-75"  on:click={() => showAddUserToGroupDrawer.set(true)}
            ><span class="mr-1">Add new user</span> <Add />
          </button>
        {/if}
      </div>
      <div class="rounded my-6">
        <!-- {#if $selectedGroup}
          <button
            class="bg-macchiato-lavender text-macchiato-base p-2 rounded-md"
            on:click={() => showAddUserToGroupDrawer.set(true)}>Add User</button
          >
        {/if} -->
        <table class="min-w-max w-full table-auto table-layout-fixed">
          <thead>
            <tr class="text-sm leading-normal">
              <th class="py-3 px-3 text-left whitespace-nowrap w-1/2  pl-6">Name</th>
              <th class="py-3 px-3 text-left whitespace-nowrap w-1/2  pl-6">Username</th>
            </tr>
          </thead>
        </table>
        <div class="h-[42rem] overflow-y-auto">
          <table class="min-w-max w-full table-auto table-layout-fixed">
            <tbody class="text-xl font-light">
              {#each groupUsers as user}
                <tr
                  class="border border-transparent hover:border-macchiato-sky hover:bg-macchiato-surface1"
                >
                  <td class="py-3 px-6 text-left whitespace-nowrap">
                    {user.name}
                  </td>
                  <td class="py-3 px-6 text-left">
                    {user.username}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
>>>>>>> f0817b9 (working list top search and btns progress)
    </div>
  </div>
