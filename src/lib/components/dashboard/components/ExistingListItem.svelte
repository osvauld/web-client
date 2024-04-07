<script lang="ts">
  import { setbackground } from "../helper";
  import BinIcon from "../../basic/icons/binIcon.svelte";
  import DownArrow from "../../basic/icons/downArrow.svelte";
  import { createEventDispatcher } from "svelte";
  import AccessSelector from "./AccessSelector.svelte";

  const dispatch = createEventDispatcher();
  export let item;
  export let index;
  export let editPermissionTrigger;
  let permissionChanged = false;
  let accessSelectorIdentifier = null;

  const handleItemRemove = () => {
    dispatch("remove");
  };

  const eventPasser = (e) => {
    item = { ...item, accessType: e.detail.permission };
    permissionChanged = !permissionChanged;
    dispatch("permissonChange", e.detail.permission);
    accessSelectorIdentifier = null;
  };
  const changePermissionHandler = () => {
    permissionChanged = !permissionChanged;
    accessSelectorIdentifier = index;
  };
</script>

<div
  class="relative w-full my-2 px-2 border border-osvauld-iconblack rounded-lg cursor-pointer flex items-center justify-between text-osvauld-sheffieldgrey font-normal text-base"
>
  <div class="flex items-center space-x-4">
    <p
      class="p-1 w-3/4 whitespace-nowrap {permissionChanged &&
        accessSelectorIdentifier !== index &&
        'opacity-40'}"
    >
      {item.name}
    </p>
    {#if item.accessSource}
      {item.accessSource}
    {/if}
  </div>
  <div class="flex justify-center items-center">
    <button
      class="w-[10rem] rounded-md cursor-pointer px-1 py-0.5 {permissionChanged &&
        'opacity-40'} flex justify-around items-center {setbackground(
        item.accessType,
      )}"
      on:click={() => {
        if (editPermissionTrigger) {
          changePermissionHandler();
        }
      }}
    >
      <span>{item.accessType}</span>
      {#if editPermissionTrigger}
        <DownArrow type={item.accessType} />
      {/if}
    </button>
    {#if accessSelectorIdentifier === index}
      <AccessSelector on:select={(e) => eventPasser(e)} />
    {/if}
    {#if editPermissionTrigger && item.accessSource === "acquired"}
      <button
        class="p-2 {permissionChanged && 'opacity-40'}"
        on:click={handleItemRemove}
      >
        <BinIcon />
      </button>
    {/if}
  </div>
</div>
