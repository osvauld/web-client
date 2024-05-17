<script lang="ts">
  import { fetchCliUsers, addEnvironment } from "../apis";

  import { showAddEnvDrawer } from "../store";
  import ClosePanel from "../../basic/icons/closePanel.svelte";
  import { onMount } from "svelte";

  let name = "";
  let selectedUser = null;
  let cliUsers = [];

  const addEnvironmentHandler = async () => {
    console.log(selectedUser.id);
    await addEnvironment(name, selectedUser.id);
    showAddEnvDrawer.set(false);
  };

  function autofocus(node: any) {
    node.focus();
  }

  const handleClose = () => {
    showAddEnvDrawer.set(false);
  };
  onMount(async () => {
    const response = await fetchCliUsers();
    cliUsers = response.data;
  });
</script>

<form
  class="p-4 bg-osvauld-frameblack border border-osvauld-activeBorder rounded-3xl w-[35rem] h-[36rem] flex flex-col items-start justify-center gap-3"
  on:submit|preventDefault={addEnvironmentHandler}
>
  <div class="flex justify-between items-center w-full">
    <span class="text-[21px] font-medium text-osvauld-quarzowhite"
      >Create Environment</span
    >
    <button class="cursor-pointer p-2" on:click|preventDefault={handleClose}>
      <ClosePanel />
    </button>
  </div>
  <div
    class="border-b border-osvauld-iconblack w-[calc(100%+2rem)] -translate-x-4"
  ></div>

  <label for="name" class="font-bold text-base text-osvauld-textActive"
    >Name:</label
  >
  <input
    id="name"
    type="text"
    use:autofocus
    required
    bind:value={name}
    class="py-1 rounded-md items-center text-base bg-osvauld-frameblack border-osvauld-iconblack w-[95%] h-10 mx-2 focus:border-osvauld-iconblack focus:ring-0 form-input"
    autocomplete="off"
  />
  <div class="max-h-[18.75rem] flex flex-col justify-start items-center w-full">
    {#each cliUsers as user}
      <label class="w-full p-2 text-left cursor-pointer">
        <input type="radio" bind:group={selectedUser} value={user} />
        {user.username}
      </label>
    {/each}
  </div>
  <div
    class="border-b border-osvauld-iconblack w-[calc(100%+2rem)] -translate-x-4"
  ></div>

  <div class="flex justify-end items-center gap-6 w-full">
    <button
      class="text-osvauld-fadedCancel font-medium text-base"
      on:click|preventDefault={handleClose}>Cancel</button
    >
    <button
      class="border border-osvauld-iconblack py-[5px] px-[15px] text-base font-medium text-osvauld-textActive rounded-md"
      type="submit"
      disabled={name === "" || selectedUser === null}
    >
      Create Environment
    </button>
  </div>
</form>
