<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Unsubscriber } from "svelte/store";

  import {
    selectedGroup,
    showAddUserDrawer,
    showAddUserToGroupDrawer,
  } from "../store";

  import AddUser from "./AddUser.svelte";
  import AddUserToGroup from "./AddUserToGroup.svelte";

  import { User } from "../dtos";

  import { fetchGroupUsers } from "../apis";

  let groupUsers: User[] = [];
  let unsubscribe: Unsubscriber;

  onMount(() => {
    unsubscribe = selectedGroup.subscribe((value) => {
      if (value) {
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
</script>

<div class="z-50">
  {#if $showAddUserDrawer || $showAddUserToGroupDrawer}
    <div class="fixed z-10 inset-0 overflow-y-auto">
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <!-- This element is to trick the browser into centering the modal contents. -->
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

<div class="overflow-x-auto">
  <div class="min-w-screen min-h-screen flex overflow-hidden">
    <div class="w-full">
      <div class="shadow-md rounded my-6">
        {#if $selectedGroup}
          <button
            class="bg-macchiato-lavender text-macchiato-base p-2 rounded-md"
            on:click={() => showAddUserToGroupDrawer.set(true)}>Add User</button
          >
        {/if}
        <table class="min-w-max w-full table-auto">
          <thead>
            <tr class="text-sm leading-normal">
              <th class="py-3 px-6 text-left">Name</th>
              <th class="py-3 px-6 text-left">USERNAME</th>
            </tr>
          </thead>
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
  </div>
</div>
