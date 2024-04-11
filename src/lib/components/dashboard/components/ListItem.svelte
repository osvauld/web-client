<script lang="ts">
  export let item: any;
  export let isSelected: boolean;
  export let isTopList: boolean;
  export let setbackground: any;
  export let showOptions: boolean;

  let hoveredOverThisItem = false;

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
  class="relative w-[98%] my-1 ml-1 pl-2 pr-0.5 rounded-lg cursor-pointer flex items-center justify-between {(isSelected &&
    !isTopList) ||
  (hoveredOverThisItem && !isTopList)
    ? 'shadow-[0_0_0_1px_#292A36] text-osvauld-plainwhite'
    : ''} "
  on:click={handleClick}
  on:mouseenter={() => (hoveredOverThisItem = true)}
  on:mouseleave={() => (hoveredOverThisItem = false)}
>
  <div class="flex items-center space-x-4 max-w-full">
    <p
      class="py-1 px-1 max-w-full whitespace-nowrap text-base {isTopList
        ? 'text-osvauld-plainwhite'
        : 'text-osvauld-sheffieldgrey'}"
    >
      {item.name}
    </p>
  </div>
  {#if isTopList}
    <div class="flex justify-center items-center">
      <button
        class="w-[10rem] rounded-md font-normal cursor-pointer px-2 py-0.5 pl-2 text-base flex justify-around items-center {setbackground(
          item.accessType
        )}"
        >{item.accessType}
        <span> <DownArrow type={item.accessType} /></span>
      </button>
      {#if showOptions && isSelected}
        <AccessSelector on:select={(e) => eventPasser(e)} />
      {/if}
      <button class="ml-2" on:click|stopPropagation={handleRemove}
        ><BinIcon color={"#67697C"} /></button
      >
    </div>
  {/if}
  {#if !isTopList && showOptions && isSelected}
    <AccessSelector on:select={(e) => eventPasser(e)} />
  {/if}
  {#if !isTopList && !isSelected && hoveredOverThisItem}
    <span
      class="cursor-pointer text-osvauld-permissionGreenText bg-osvauld-permissionsGreen rounded-md px-2 py-0.5 w-[10rem] flex justify-around items-center text-base font-normal"
      >Permissions <span><DownArrow type={"indicator"} /></span></span
    >
  {/if}
</div>
