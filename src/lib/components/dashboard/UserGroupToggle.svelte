<script lang="ts">
  import { GroupIcon, UserIcon } from "./icons";

  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  let selectedItem = "Groups";
  const select = (item) => {
    selectedItem = item;
    dispatch("select", item);
  };
</script>

<div class="flex justify-start my-2">
  <div
    class="inline-flex justify-center space-x-1 p-1 bg-osvauld-frameblack border border-osvauld-iconblack rounded-xl xl:scale-95 lg:scale-90 md:scale-75 sm:scale-50"
  >
    {#each ["Groups", "Users"] as item}
      <button
        class="w-1/2 px-6 py-2 text-lg flex justify-center items-center rounded-lg focus:outline-none {selectedItem ===
        item
          ? 'bg-osvauld-bordergreen text-osvauld-plainwhite'
          : 'text-osvauld-quarzowhite'} "
        on:click={() => select(item)}
      >
        {#if item === "Groups"}
          <span class="scale-100">
            <GroupIcon
              color={selectedItem === "Groups" ? "white" : "#85889C"}
            />
          </span>
        {:else}
          <span class="scale-[0.80]">
            <UserIcon color={selectedItem === "Users" ? "white" : "#85889C"} />
          </span>
        {/if}
        <span class={item === "Groups" ? "ml-2" : "ml-0"}>{item}</span>
      </button>
    {/each}
  </div>
</div>
