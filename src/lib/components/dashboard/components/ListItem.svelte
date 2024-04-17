<script lang="ts">
  export let item: any;
  export let isSelected: boolean;
  export let isBottomList: boolean;
  export let setbackground: any;
  export let showOptions: boolean;
  export let reverseModal: boolean = false;

  let hoveredOverThisItem = false;

  import { BinIcon, DownArrow } from "../icons";
  import AccessSelector from "./AccessSelector.svelte";

  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  const handleRemove = () => {
    dispatch("remove", item);
  };
  const eventPasser = (e) => {
    hoveredOverThisItem = false;
    dispatch("select", { item, permission: e.detail.permission });
  };

  const handleClick = () => {
    dispatch("click");
  };

  /* eslint-disable */
</script>

<div
  class="relative w-[98%] my-1 ml-1 pl-2 pr-0.5 rounded-lg cursor-pointer flex items-center justify-between text-osvauld-sheffieldgrey text-base font-normal {(isSelected &&
    !isBottomList) ||
  (hoveredOverThisItem && !isBottomList)
    ? 'shadow-[0_0_0_1px_#292A36] '
    : ''}{showOptions && isSelected
    ? 'bg-osvauld-cardshade text-osvauld-textActive'
    : ''}"
  on:click={handleClick}
  on:mouseenter={() => (hoveredOverThisItem = true)}
  on:mouseleave={() => (hoveredOverThisItem = false)}
>
  <div class="flex items-center space-x-4 max-w-full">
    <p
      class="py-1 px-1 max-w-full whitespace-nowrap text-base {isBottomList ||
      hoveredOverThisItem
        ? 'text-osvauld-textActive'
        : 'text-osvauld-sheffieldgrey'}"
    >
      {item.name}
    </p>
  </div>
  {#if isBottomList}
    <div class="flex justify-center items-center">
      <button class="mr-3" on:click|stopPropagation={handleRemove}
        ><BinIcon color={"#67697C"} /></button
      >
      <button
        class="w-[9.8rem] rounded-md font-normal cursor-pointer px-2 py-0.5 pl-2 text-base flex justify-around items-center {setbackground(
          item.accessType
        )}"
        >{item.accessType}
        <span> <DownArrow type={item.accessType} /></span>
      </button>
      {#if showOptions && isSelected}
        <AccessSelector on:select={(e) => eventPasser(e)} {reverseModal} />
      {/if}
    </div>
  {/if}
  {#if !isBottomList && showOptions && isSelected}
    <AccessSelector on:select={(e) => eventPasser(e)} {reverseModal} />
  {/if}
  {#if !isBottomList && hoveredOverThisItem}
    <span
      class="cursor-pointer text-osvauld-permissionGreenText bg-osvauld-permissionsGreen rounded-md px-1 py-0.5 w-[9.8rem] flex justify-around items-center text-base font-normal"
      >Permissions <span class="-rotate-90"
        ><DownArrow type={"indicator"} /></span
      ></span
    >
  {/if}
</div>
