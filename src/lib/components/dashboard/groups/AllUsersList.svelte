<script lang="ts">
  import { Lens, Add, BinIcon } from "../icons";
  import { showAddUserDrawer } from "../store";
  import { deleteUser, fetchAllUsers } from "../apis";
  import AddUser from "./AddUser.svelte";
  import { onMount } from "svelte";
  let accountRole: string = "";
  let addUserHovered = false;
  let allUsers = [];
  const deleteUserHandler = async (id) => {
    await deleteUser(id);
    const allUsersResponse = await fetchAllUsers();
    allUsers = allUsersResponse.data;
  };
  onMount(async () => {
    const accountDetails = localStorage.getItem("user");
    accountRole = JSON.parse(accountDetails).type;
    const fetchAllUsersResponse = await fetchAllUsers();
    allUsers = fetchAllUsersResponse.data;
  });
</script>

<div class="flex items-center justify-between px-4 py-5 pb-0">
  <h1 class="text-4xl p-4 font-normal w-1/3 ml-3">All Users</h1>
  <button
    class="border border-osvauld-iconblack rounded-md py-1 px-4 mr-2 text-osvauld-textActive flex justify-center items-center whitespace-nowrap font-light text-base hover:text-osvauld-frameblack hover:bg-osvauld-carolinablue {accountRole ===
    'user'
      ? 'invisible'
      : ''}"
    on:mouseenter={() => (addUserHovered = true)}
    on:mouseleave={() => (addUserHovered = false)}
    on:click={() => showAddUserDrawer.set(true)}
  >
    <span class="mr-1">Add new user</span>
    <Add color={addUserHovered ? "#0D0E13" : "#A3A4B5"} />
  </button>
</div>
<div class="rounded my-6 px-10">
  <table class="min-w-max w-full table-auto">
    <thead>
      <tr class="leading-normal text-lg">
        <th class="py-3 px-3 text-left whitespace-nowrap w-1/5">Name</th>
        <th class="py-3 px-3 text-left whitespace-nowrap w-1/5">Username</th>
        <th class="py-3 px-3 text-left whitespace-nowrap w-1/5">Role</th>
        <th class="py-3 px-3 text-left whitespace-nowrap w-1/5">Status</th>
        <th class="py-3 px-3 text-left whitespace-nowrap w-1/5">Actions</th>
      </tr>
    </thead>
  </table>

  <div class="h-[35rem] overflow-y-auto scrollbar-thin">
    <table class="min-w-max w-full table-auto">
      <tbody class="text-xl text-osvauld-dusklabel font-normal text-sm">
        {#each allUsers as user}
          <tr
            class="border border-transparent hover:bg-osvauld-modalFieldActive text-osvauld-dusklabel hover:text-osvauld-sideListTextActive text-base font-light border-b border-b-osvauld-iconblack transition-colors duration-300"
          >
            <td
              class="py-5 px-6 text-left whitespace-nowrap w-1/5 transition-colors duration-300"
              >{user.name}</td
            >
            <td class="py-5 px-6 text-left w-1/5 transition-colors duration-300"
              >{user.username}</td
            >
            <td
              class="py-5 px-6 text-left w-1/5 transition-colors duration-300"
            >
              <span
                class="inline-block w-[70%] px-4 py-1 rounded-md text-center transition-colors duration-300 {user.type ===
                'admin'
                  ? 'bg-osvauld-ownerGreen text-osvauld-ownerText'
                  : 'bg-osvauld-readerOrange text-osvauld-readerText'}"
              >
                {user.type}
              </span>
            </td>
            <td class="py-5 px-6 text-left w-1/5 transition-colors duration-300"
              >{user.status}</td
            >
            <td
              class="flex justify-center items-center py-5 w-1/5 cursor-pointer transition-colors duration-300"
            >
              <button on:click={() => deleteUserHandler(user.id)}>
                <BinIcon />
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
<div class="z-50">
  {#if $showAddUserDrawer}
    <button
      class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
      on:click={() => {}}
    >
      <button class="p-6 rounded bg-transparent" on:click|stopPropagation>
        <AddUser />
      </button>
    </button>
  {/if}
</div>
