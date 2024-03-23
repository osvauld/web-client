<script lang="ts">
  import { createFolder, fetchAllFolders } from "../apis";
  import { showAddFolderDrawer, folderStore } from "../store";
  import { ClosePanel } from "../icons";

  let name = "";
  let description = "";

  function autofocus(node) {
    node.focus();
  }

  const addFolderFunc = async () => {
    const payload = {
      name: name,
      description: description,
    };
    await createFolder(payload);
    const responseJson = await fetchAllFolders();
    folderStore.set(responseJson.data);
    showAddFolderDrawer.set(false);
  };

  const handleClose = () => {
    showAddFolderDrawer.set(false);
  };
</script>

<div
  class="flex flex-col p-6 border border-osvauld-iconblack bg-osvauld-frameblack rounded-lg"
>
  <button on:click={handleClose} class="ml-auto"><ClosePanel /></button>
  <label for="name" class="mb-2 font-bold text-lg">Name:</label>
  <input
    id="name"
    type="text"
    use:autofocus
    bind:value={name}
    class=" py-1 rounded-sm items-center text-base bg-osvauld-frameblack border-osvauld-iconblack w-[95%] h-10 mx-2 focus:border-osvauld-iconblack focus:ring-0"
    autocomplete="off"
  />

  <label for="description" class="mb-2 font-bold text-lg">Description:</label>
  <textarea
    id="description"
    bind:value={description}
    class=" py-1 rounded-sm items-center text-base bg-osvauld-frameblack border-osvauld-iconblack w-[95%] h-20 mx-2 focus:border-osvauld-iconblack focus:ring-0"
  ></textarea>

  <button
    class="bg-osvauld-carolinablue rounded-md p-2 mt-4 text-osvauld-ninjablack"
    on:click={addFolderFunc}>Submit</button
  >
</div>
