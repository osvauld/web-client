<script lang="ts">
  import { setbackground } from "../helper";
  import BinIcon from "../../basic/icons/binIcon.svelte";
  import DownArrow from "../../basic/icons/downArrow.svelte";
  import { createEventDispatcher } from "svelte";
  import AccessSelector from "./AccessSelector.svelte";
  import InfoIcon from "../../basic/icons/infoIcon.svelte";

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
    console.log("firing event parser");
    item = { ...item, accessType: e.detail.permission };
    permissionChanged = !permissionChanged;
    dispatch("permissonChange", e.detail.permission);
    accessSelectorIdentifier = null;
  };
  const changePermissionHandler = () => {
    if (editPermissionTrigger) {
      if (
        (item.accessSource && item.accessSource === "acquired") ||
        !item.accessSource
      ) {
        permissionChanged = !permissionChanged;
        accessSelectorIdentifier = index;
      }
    }
  };
</script>

<div
  class="relative w-full my-2 pl-2 pr-0.5 border border-osvauld-iconblack rounded-lg cursor-pointer flex items-center justify-between text-osvauld-sheffieldgrey font-normal text-base"
>
  <div class="flex items-center justify-center">
    <p
      class="p-1 w-3/4 whitespace-nowrap {permissionChanged &&
        accessSelectorIdentifier !== index &&
        'opacity-40'}"
    >
      {item.name}
    </p>
    {#if item.accessSource}
      <span class="text-xs ml-auto">*{item.accessSource}</span>
    {/if}
  </div>
  {#if (item.accessSource && item.accessSource === "acquired") || !item.accessSource}
    {#if accessSelectorIdentifier === index}
      <AccessSelector on:select={(e) => eventPasser(e)} />
    {/if}
    {#if editPermissionTrigger}
      <button
        class="ml-auto {permissionChanged && 'opacity-40'}"
        on:click={handleItemRemove}
      >
        {#if item.accessSource === "acquired"}
          <BinIcon />
        {:else if item.accessSource === "inherited"}
          <InfoIcon />
        {/if}
      </button>
    {/if}
  {/if}
  <div class="flex justify-center items-center ml-2">
    <button
      class="w-[7rem] rounded-md cursor-pointer px-1 py-0.5 {permissionChanged &&
        'opacity-40'} flex justify-around items-center {setbackground(
        item.accessType,
      )}"
      on:click={changePermissionHandler}
    >
      <span>{item.accessType}</span>
      {#if editPermissionTrigger && ((item.accessSource && item.accessSource === "acquired") || !item.accessSource)}
        <DownArrow type={item.accessType} />
      {/if}
    </button>
  </div>
</div>
