<script>
  let name = "";
  import { fetchAllUserGroups, createGroup } from "../../apis/group.api";
  import { showAddGroupDrawer } from "../../store/ui.store";

  const addGroupFunc = async () => {
    const payload = {
      name: name,
    };
    await createGroup(payload);
    await fetchAllUserGroups();
    showAddGroupDrawer.set(false);
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

  <button class="bg-blue-900 rounded-full p-2" on:click={addGroupFunc}
    >Submit</button
  >
</div>
