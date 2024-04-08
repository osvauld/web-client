<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import ExistingListItem from "./ExistingListItem.svelte";

  export let existingItemsData;
  export let editPermissionTrigger;

  const dispatch = createEventDispatcher();

  const handleRemoval = (item) => {
    dispatch("remove", item);
  };

  const handlePermissionChange = (e, item) => {
    dispatch("permissionChange", { item, permission: e.detail });
  };
</script>

<div class="p-2 my-2 w-full rounded-lg min-h-0 max-h-[50vh] mb-2">
  <div
    class="overflow-y-scroll scrollbar-thin min-h-0 max-h-[30vh] bg-osvauld-frameblack w-full"
  >
    {#if ExistingListItem}
      {#each existingItemsData as item, index}
        <!-- TODO: user should not be able to remove themselves -->
        <ExistingListItem
          {index}
          {item}
          {editPermissionTrigger}
          on:remove={() => handleRemoval(item)}
          on:permissonChange={(e) => handlePermissionChange(e, item)}
        />
      {/each}
    {/if}
  </div>
</div>
