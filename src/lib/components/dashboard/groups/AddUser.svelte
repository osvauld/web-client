<script lang="ts">
  import { getTokenAndBaseUrl } from "../helper";
  import Loader from "../components/Loader.svelte";
  import RoleToggle from "../../basic/RoleToggle.svelte";
  import { showAddUserDrawer, allUsersSelected } from "../store";
  import { createUser, checkUserNameExists } from "../apis";
  import { ClosePanel, Tick } from "../icons";
  import { generatePassword } from "../helper";

  let username = "";
  let name = "";
  let copiedToClipboard = false;
  let isLoaderActive = false;
  let erroMessage = "";
  let assignedRole = "user";
  $: activeButton = username.length >= 3 && name.length >= 3;

  const submit = async (event) => {
    event.preventDefault();
    isLoaderActive = true;
    const response = await checkUserNameExists(username, name);
    if (response.data.available === false) {
      erroMessage = response.data.message;
      isLoaderActive = false;
      return;
    }
    const { baseUrl } = await getTokenAndBaseUrl();
    const tempPassword = generatePassword(10);
    const payload = {
      username,
      name,
      type: assignedRole,
      tempPassword,
    };
    await createUser(payload);
    const shareWithMember = JSON.stringify({ username, tempPassword, baseUrl });
    await navigator.clipboard.writeText(shareWithMember);
    copiedToClipboard = true;
    isLoaderActive = false;
    setTimeout(() => {
      showAddUserDrawer.set(false);
      allUsersSelected.set(true);
    }, 3000);
  };

  const roleManager = async (e: any) => {
    e.preventDefault();
    assignedRole = e.detail;
  };

  const handleClose = () => {
    showAddUserDrawer.set(false);
  };
</script>

<div class="bg-osvauld-frameblack rounded-3xl h-[30rem] w-[23rem] p-6 pt-2">
  <div class="flex justify-between items-center px-4 py-6">
    <p class="text-2xl font-sans font-normal text-osvauld-dusklabel">
      Add new user
    </p>
    <button class="bg-osvauld-frameblack" on:click|stopPropagation={handleClose}
      ><ClosePanel /></button
    >
  </div>

  <div
    class="border border-osvauld-iconblack w-[calc(100%+3rem)] -translate-x-6 my-10 mt-0"
  ></div>

  <form
    on:submit={submit}
    class="h-1/2 flex flex-col justify-between items-center"
  >
    <div class="mb-4 w-full">
      <label
        for="username"
        class="label block mb-2 text-left text-osvauld-dusklabel text-sm font-normal cursor-pointer"
        >Username:</label
      >
      <input
        id="username"
        bind:value={username}
        type="text"
        placeholder="Enter username"
        class="py-1 rounded-sm items-center text-base bg-osvauld-frameblack border-osvauld-iconblack w-[95%] h-10 mx-2 focus:border-osvauld-iconblack focus:ring-0"
        required
        autocomplete="off"
      />
    </div>

    <div class="mb-4 w-full">
      <label
        for="name"
        class="label block mb-2 text-left text-osvauld-dusklabel text-sm font-normal cursor-pointer"
        >Full Name:</label
      >
      <input
        id="name"
        bind:value={name}
        type="text"
        placeholder="Enter full name here"
        required
        class="py-1 rounded-sm items-center text-base bg-osvauld-frameblack border-osvauld-iconblack w-[95%] h-10 mx-2 focus:border-osvauld-iconblack focus:ring-0"
        autocomplete="off"
      />
    </div>

    <div class="mb-4 w-full">
      <label
        for="role"
        class="label block mb-2 text-left text-osvauld-dusklabel text-sm font-normal cursor-pointer"
        >Select Role:</label
      >
      <RoleToggle on:select={roleManager} />
    </div>

    <button
      class="w-full px-4 py-2 mt-3 flex justify-center items-center border border-osvauld-placeholderblack rounded-md {activeButton
        ? 'bg-osvauld-carolinablue text-osvauld-ninjablack'
        : 'bg-osvauld-iconblack text-osvauld-sheffieldgrey'}"
      type="submit"
      on:click|stopPropagation
    >
      {#if isLoaderActive}
        <Loader />
      {:else if copiedToClipboard}
        <Tick />
        <span class="ml-2">Copied to clipboard</span>
      {:else}
        Create User
      {/if}
    </button>
    {#if erroMessage}
      <p class="text-base text-sm">{erroMessage}</p>
    {/if}
  </form>
</div>
