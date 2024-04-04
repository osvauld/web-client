<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import ExistingListItem from "./ExistingListItem.svelte";
  import { DownArrow, RightArrow } from "../icons";

  export let existingItemDropdown;
  export let existingItemsData;
  export let user;

  const dispatch = createEventDispatcher();

  const dispatchClick = () => {
    dispatch("click");
  };

  const handleRemoval = (item) => {
    dispatch("remove", item);
  };

  const handlePermissionChange = (e, item) => {
    dispatch("permissionChange", { item, permission: e.detail });
  };
</script>

<div
  class="p-2 my-2 border border-osvauld-iconblack rounded-lg min-h-min max-h-[50vh] mb-2"
>
  <button
    class="flex justify-between items-center p-1 w-full bg-osvauld-frameblack text-osvauld-sheffieldgrey text-base font-semibold cursor-pointer border border-osvauld-iconblack rounded-lg"
    on:click={dispatchClick}
  >
    <span class="ml-3 text-base font-normal">
      {user ? "Users" : "Groups"} with Access</span
    >
    <span class="bg-osvauld-bordergreen px-4 py-1 rounded-[4px] z-0">
      {#if existingItemDropdown}
        <DownArrow type={"common"} />
      {:else}
        <RightArrow />
      {/if}
    </span>
  </button>
  <div
    class="overflow-y-scroll scrollbar-thin min-h-0 max-h-[18vh] bg-osvauld-frameblack w-full"
  >
    {#if existingItemDropdown}
      {#each existingItemsData as item, index}
        <!-- TODO: user should not be able to remove themselves -->
        <ExistingListItem
          {index}
          {item}
          on:remove={() => handleRemoval(item)}
          on:permissonChange={(e) => handlePermissionChange(e, item)}
        />
      {/each}
    {/if}
  </div>
</div>
