<script lang="ts">
  import { createFolder, fetchAllFolders } from "../apis";
  import { showAddFolderDrawer, folderStore } from "../store";
  import { ClosePanel } from "../icons";

  let name = "";
  let description = "";

  function autofocus(node: any) {
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

<form
  class="p-4 bg-osvauld-frameblack border border-osvauld-activeBorder rounded-3xl w-[32rem] h-[25rem] flex flex-col items-start justify-center gap-3"
  on:submit|preventDefault={addFolderFunc}
>
  <div class="flex justify-between items-center w-full">
    <span class="text-[21px] font-medium text-osvauld-quarzowhite"
      >Create Folder</span
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
    class="py-1 rounded-sm items-center text-base bg-osvauld-frameblack border-osvauld-iconblack w-[95%] h-10 mx-2 focus:border-osvauld-iconblack focus:ring-0 form-input"
    autocomplete="off"
  />

  <label for="description" class="font-bold text-base text-osvauld-textActive"
    >Description:</label
  >
  <textarea
    id="description"
    bind:value={description}
    class="py-1 rounded-sm items-center text-base bg-osvauld-frameblack border-osvauld-iconblack w-[95%] h-20 mx-2 focus:border-osvauld-iconblack focus:ring-0 form-textarea"
  ></textarea>
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
      disabled={!name}>Add Folder</button
    >
  </div>
</form>
