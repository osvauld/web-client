<script lang="ts">
  import { createFolder, fetchAllFolders } from "../apis";
  import { showAddFolderDrawer, folderStore } from "../store";

  let name = "";
  let description = "";

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
</script>

<div class="flex flex-col p-6 rounded shadow-lg">
  <label for="name" class="mb-2 font-bold text-lg">Name:</label>
  <input
    id="name"
    type="text"
    bind:value={name}
    class="mb-4 p-2 border rounded bg-[#2E3654]"
  />

  <label for="description" class="mb-2 font-bold text-lg">Description:</label>
  <textarea
    id="description"
    bind:value={description}
    class="p-2 border rounded bg-[#2E3654]"
  ></textarea>

  <button class="bg-[#4E46DC] rounded-full p-2" on:click={addFolderFunc}
    >Submit</button
  >
</div>
