<script lang="ts">
  export let item: any;
  export let isSelected: boolean;
  export let isTopList: boolean;
  export let setbackground: any;
  export let showOptions: boolean;

  import { BinIcon, DownArrow } from "../icons";
  import AccessSelector from "./AccessSelector.svelte";

  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  const handleRemove = () => {
    dispatch("remove", item);
  };
  const eventPasser = (e) => {
    dispatch("select", { item, permission: e.detail.permission });
  };

  const handleClick = () => {
    dispatch("click");
  };

  /* eslint-disable */
</script>

<div
  class="relative w-[99%] my-1 px-2 border border-osvauld-iconblack rounded-lg cursor-pointer flex items-center justify-between {isSelected
    ? 'bg-osvauld-bordergreen text-osvauld-plainwhite'
    : ''}"
  on:click={handleClick}
>
  <div class="flex items-center space-x-4 max-w-full">
    <p
      class="py-0.5 px-1 max-w-full whitespace-nowrap text-base {isTopList
        ? 'text-osvauld-plainwhite'
        : 'text-osvauld-sheffieldgrey'}"
    >
      {item.name}
    </p>
  </div>
  {#if isTopList}
    <div class="flex justify-center items-center">
      <button
        class="w-[6.25rem] rounded-md font-normal cursor-pointer px-2 py-0 pl-2 text-base flex justify-between items-center {setbackground(
          item.accessType
        )}"
        >{item.accessType}
        <span> <DownArrow type={item.accessType} /></span>
      </button>
      {#if showOptions && isSelected}
        <AccessSelector on:select={(e) => eventPasser(e)} />
      {/if}
      <button class="ml-2" on:click|stopPropagation={handleRemove}
        ><BinIcon /></button
      >
    </div>
  {/if}
  {#if !isTopList && showOptions && isSelected}
    <AccessSelector on:select={(e) => eventPasser(e)} />
  {/if}
</div>
