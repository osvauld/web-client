<script lang="ts">
  import { setbackground } from "../helper";
  import BinIcon from "../../basic/icons/binIcon.svelte";
  import DownArrow from "../../basic/icons/downArrow.svelte";
  import { createEventDispatcher } from "svelte";
  import AccessSelector from "./AccessSelector.svelte";
  import {
    editPermissionTrigger,
    isPermissionChanged,
    accessSelectorIdentifier,
  } from "../store";

  const dispatch = createEventDispatcher();
  export let item;
  export let index;

  const handleItemRemove = () => {
    dispatch("remove");
  };

  console.log(item.accessType);
  const eventPasser = (e) => {
    item = { ...item, accessType: e.detail.permission };
    isPermissionChanged.set(!$isPermissionChanged);
    console.log(e.detail.permission);
    dispatch("permissonChange", e.detail.permission);
  };
  const changePermissionHandler = () => {
    isPermissionChanged.set(!$isPermissionChanged);
    accessSelectorIdentifier.set(index);
  };
</script>

<div
  class="relative w-full my-2 px-2 border border-osvauld-bordergreen rounded-lg cursor-pointer flex items-center justify-between"
>
  <div class="flex items-center space-x-4">
    <p
      class="p-2 w-3/4 whitespace-nowrap {$isPermissionChanged &&
        $accessSelectorIdentifier !== index &&
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
      class="w-[10rem] rounded-md cursor-pointer px-2 py-1 {$isPermissionChanged &&
        'opacity-40'} flex justify-around items-center {setbackground(
        item.accessType,
      )}"
      on:click={() => {
        if ($editPermissionTrigger) {
          changePermissionHandler();
          // Here set anew variable with index
        }
      }}
    >
      <span>{item.accessType}</span>
      {#if $editPermissionTrigger}
        <DownArrow type={item.accessType} />
      {/if}
    </button>
    {#if $accessSelectorIdentifier === index}
      <!-- Here check the index with editpermission trigger -->
      <AccessSelector on:select={(e) => eventPasser(e)} />
    {/if}
    {#if $editPermissionTrigger}
      <button
        class="p-2 {$isPermissionChanged && 'opacity-40'}"
        on:click={handleItemRemove}
      >
        <BinIcon />
      </button>
    {/if}
  </div>
</div>
