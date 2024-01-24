<script lang="ts">
    export let item;
    export let isSelected;
    export let isTopList;
    export let setbackground;
    export let showOptions;

    import { BinIcon, DownArrow } from "../icons";
    import AccessSelector from "./AccessSelector.svelte";

    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    const handleRemove = () => {
        dispatch("remove", item);
    };
    const eventPasser = (e: any) => {
        dispatch("select", e.detail);
    };

    const handleClick = () => {
        dispatch("click");
    };

    /* eslint-disable */
</script>

<div
    class="relative w-[95%] my-2 px-2 border border-osvauld-bordergreen rounded-lg cursor-pointer flex items-center justify-between {isSelected
        ? 'bg-osvauld-bordergreen'
        : ''}"
    on:click={handleClick}
>
    <div class="flex items-center space-x-4">
        <p
            class="p-2 w-3/4 whitespace-nowrap text-base {isTopList
                ? 'text-osvauld-quarzowhite'
                : 'text-osvauld-sheffieldgrey'}"
        >
            {item.name}
        </p>
    </div>
    {#if isTopList}
        <div class="flex justify-center items-center">
            <button
                class="w-[100px] rounded-md cursor-pointer px-2 py-1 pl-2 flex justify-between items-center {setbackground(
                    item.accessType,
                )}"
                >{item.accessType}
                <span> <DownArrow type={item.accessType} /></span>
            </button>
            {#if showOptions && isSelected}
                <AccessSelector {item} on:select={(e) => eventPasser(e)} />
            {/if}
            <button class="ml-2" on:click|stopPropagation={handleRemove}
                ><BinIcon /></button
            >
        </div>
    {/if}
    {#if !isTopList && showOptions && isSelected}
        <AccessSelector {item} on:select={(e) => eventPasser(e)} />
    {/if}
</div>
