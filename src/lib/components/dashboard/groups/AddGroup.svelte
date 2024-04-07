<script lang="ts">
  import { fetchAllUserGroups, createGroup } from "../apis";
  import { showAddGroupDrawer } from "../store";
  import ClosePanel from "../../basic/icons/closePanel.svelte";
  import { groupStore } from "../store";
  let name = "";
  const addGroupFunc = async () => {
    const payload = {
      name: name,
    };
    await createGroup(payload);
    const responseJson = await fetchAllUserGroups();
    groupStore.set(responseJson.data);
    showAddGroupDrawer.set(false);
  };

  const handleClose = () => {
    showAddGroupDrawer.set(false);
  };
</script>

<form
  class="flex flex-col p-6 border-2 border-osvauld-iconblack bg-osvauld-frameblack rounded-lg"
  on:submit|preventDefault={addGroupFunc}
>
  <button type="button" on:click={handleClose} class="ml-auto"
    ><ClosePanel /></button
  >

  <label for="name" class="mb-2 font-bold text-lg">Name:</label>
  <input
    id="name"
    type="text"
    bind:value={name}
    autocomplete="off"
    required
    class="py-1 rounded-sm items-center text-base bg-osvauld-frameblack border-osvauld-iconblack
     w-[95%] h-10 mx-2 focus:border-osvauld-iconblack focus:ring-0 mb-4 form-input"
  />

  <button
    type="submit"
    class="bg-osvauld-carolinablue text-black rounded-md p-2 disabled:opacity-50"
    disabled={!name}
  >
    Submit
  </button>
</form>
