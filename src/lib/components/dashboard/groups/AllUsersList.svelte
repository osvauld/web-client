<script lang="ts">
  import { Lens, Add, BinIcon } from "../icons";
  import { showAddUserDrawer } from "../store";
  import { deleteUser, fetchAllUsers } from "../apis";
  import AddUser from "./AddUser.svelte";
  import { onMount } from "svelte";

  export let allUsers;

  let accountRole: string = "";

  const deleteUserHandler = async (id) => {
    await deleteUser(id);
    const allUsersResponse = await fetchAllUsers();
    allUsers = allUsersResponse.data;
  };

  onMount(() => {
    const accountDetails = localStorage.getItem("user");
    accountRole = JSON.parse(accountDetails).type;
  });
</script>

<div class="flex items-center justify-between px-4 py-5 pb-0">
  <h1 class="text-4xl p-4 font-normal w-1/3 ml-3">All Users</h1>
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
    class="rounded-md py-1 px-4 mr-2 bg-osvauld-carolinablue text-macchiato-surface0 flex justify-center items-center whitespace-nowrap xl:scale-90 lg:scale-95 md:scale-90 sm:scale-75 {accountRole ===
    'user'
      ? 'invisible'
      : ''}"
    on:click={() => showAddUserDrawer.set(true)}
  >
    <span class="mr-1">Add new user</span>
    <Add color={"#010409"} />
  </button>
</div>
<div class="rounded my-6 px-10">
  <table class="min-w-max w-full table-auto table-layout-fixed">
    <thead>
      <tr class="leading-normal text-lg">
        <th class="py-3 px-3 text-left whitespace-nowrap w-1/5 pl-6">Name</th>
        <th class="py-3 px-3 text-left whitespace-nowrap w-1/3">Username</th>
      </tr>
    </thead>
  </table>
  <div class="h-[35rem] overflow-y-scroll scrollbar-thin px-2">
    <table class="min-w-max w-full table-auto table-layout-fixed">
      <tbody class="text-xl text-osvauld-dusklabel font-normal text-sm">
        {#each allUsers as user}
          <tr class="border border-transparent hover:bg-osvauld-bordergreen">
            <td class="py-6 px-6 text-left whitespace-nowrap">
              {user.name}
            </td>
            <td class="py-6 px-6 text-left">
              {user.username}
            </td>
            <td
              class="flex justify-center items-center py-6 w-[4rem] cursor-pointer"
            >
              <button
                on:click={() => {
                  deleteUserHandler(user.id);
                }}
              >
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
