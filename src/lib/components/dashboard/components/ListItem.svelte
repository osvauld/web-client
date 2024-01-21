<script lang="ts">
    export let user;
    export let isSelected;
    export let isTopList;
    export let setbackground;
    export let showOptions;
    import BinIcon from "../../basic/binIcon.svelte";
    import DownArrow from "../../basic/downArrow.svelte";
    import AccessSelector from '../components/accessSelector.svelte';

    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
    
    const handleRemove = () => {
        dispatch('remove', user);
    }
    const eventPasser =(e: any)=> {
        dispatch("select", e.detail);
    };

    const handleClick = () => {
        dispatch("click");
    }

    /* eslint-disable */
</script>

<div
    class="relative w-[95%] my-2 px-2 border border-osvauld-bordergreen rounded-lg cursor-pointer flex items-center justify-between {isSelected ? 'bg-osvauld-bordergreen' : ''}"
    on:click={handleClick}>
    <div class="flex items-center space-x-4">
        <p class="p-2 w-3/4 whitespace-nowrap">{user.name}</p>
    </div>
    {#if isTopList}
        <div class="flex justify-center items-center">
            <button class="w-[100px] rounded-md cursor-pointer px-2 py-1 pl-2 flex justify-between items-center {setbackground(user.accessType)}">{user.accessType}
                <span> <DownArrow type={user.accessType}/></span>
            </button>
            {#if showOptions && isSelected}
                <AccessSelector {user}  on:select={(e)=>eventPasser(e)}  />
            {/if}
            <button class="ml-2" on:click|stopPropagation={handleRemove}><BinIcon/></button>
        </div>
    {/if}
    {#if !isTopList && showOptions && isSelected}
        <AccessSelector {user} on:select={(e)=>eventPasser(e)} />
    {/if}
</div>
