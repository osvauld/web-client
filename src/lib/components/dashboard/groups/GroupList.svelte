<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Unsubscriber, writable } from "svelte/store";

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
  import { Lens, Share, Add, EditIcon, BinIcon } from '../icons';

  let groupUsers: User[] = [];
  let unsubscribe: Unsubscriber;
  let selectedAllUsers = false;
  let groupName = writable("");
  let allUsers: User[] = [];

  onMount(() => {
    unsubscribe = selectedGroup.subscribe((value) => {
      if (value) {
        $groupName = value.name
        selectedAllUsers = false;
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

  if(adminStatus && allUsersSelected){
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
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span
          class="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true">&#8203;</span
        >

        <div
          class="inline-block align-bottom bg-white rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
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
      <div class="flex items-center justify-between px-4 py-5 pb-0">
        <h1 class="text-4xl p-4 font-normal w-1/3 ml-3">{ adminStatus && $allUsersSelected ? 'All Users' : $groupName}</h1>
        <div
          class="h-[2.1rem] w-1/3 px-2 flex justify-start items-center border border-osvauld-iconblack rounded-lg cursor-pointer"
        >
          <Lens />
          <input
            type="text"
            class="h-[1.76rem] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
            placeholder="Search for group members.."
          />
        </div>
        <button
          class="rounded-md py-1 px-4 mr-2 bg-osvauld-carolinablue text-macchiato-surface0 flex justify-center items-center whitespace-nowrap xl:scale-90 lg:scale-95 md:scale-90 sm:scale-75"
        on:click={$allUsersSelected ? () => showAddUserDrawer.set(true) : () => showAddUserToGroupDrawer.set(true)} > 
          <span class="mr-1">Add new user</span>
          <Add />
        </button>
      </div>
        <div class="rounded my-6 px-10">
          <table class="min-w-max w-full table-auto table-layout-fixed">
            <thead>
              <tr class="leading-normal text-lg">
                <th class="py-3 px-3 text-left whitespace-nowrap w-1/4 pl-6">Name</th>
                <th class="py-3 px-3 text-left whitespace-nowrap w-1/3 ">Username</th>
              </tr>
            </thead>
          </table>
          <div class="h-[40rem] overflow-y-auto scrollbar-thin px-2">
            <table class="min-w-max w-full table-auto table-layout-fixed">
              <tbody class="text-xl text-osvauld-dusklabel font-normal text-sm">
                {#each $allUsersSelected ? allUsers : groupUsers as user}
                  <tr
                    class="border border-transparent hover:bg-osvauld-bordergreen"
                  >
                    <td class="py-6 px-6 text-left whitespace-nowrap">
                      {user.name}
                    </td>
                    <td class="py-6 px-6 text-left">
                      {user.username}
                    </td>
                    <td class="flex justify-between items-center py-6 w-[4rem]">
                      <BinIcon/>
                      <EditIcon/>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  </div>
