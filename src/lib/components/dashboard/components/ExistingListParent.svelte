<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import ExistingListItem from "./ExistingListItem.svelte";
  import { DownArrow, RightArrow } from "../icons";
  import { log } from "console";

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
</script>

<div
  class="p-2 my-2 border border-osvauld-bordergreen rounded-lg min-h-min max-h-[50vh] mb-2"
>
  <button
    class="flex justify-between items-center p-1 w-full bg-osvauld-frameblack text-osvauld-sheffieldgrey text-base font-semibold cursor-pointer border border-osvauld-bordergreen rounded-lg"
    on:click={dispatchClick}
  >
    <span class="ml-3"> {user ? "Users" : "Groups"} with Access</span>
    <span class="bg-osvauld-bordergreen px-4 py-1 rounded-[4px]">
      {#if existingItemDropdown}
        <DownArrow type={"common"} />
      {:else}
        <RightArrow />
      {/if}
    </span>
  </button>
  {#if existingItemDropdown}
    <div class="border border-osvauld-bordergreen my-2 w-full"></div>
  {/if}
  <div
    class="overflow-y-scroll scrollbar-thin h-[18vh] bg-osvauld-frameblack w-full"
  >
    {#each existingItemsData as item, index}
      <!-- TODO: user should not be able to remove themselves -->
      <ExistingListItem {item} on:remove={() => handleRemoval(item)} />
    {/each}
  </div>
</div>
