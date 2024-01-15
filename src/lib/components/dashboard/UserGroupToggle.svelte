<script>
    import GroupIcon from "../../basic/groupIcon.svelte";
    import UserIcon from "../../basic/userIcon.svelte";
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
        class="inline-flex justify-center space-x-1 p-1 bg-osvauld-frameblack border-2 border-osvauld-bordergreen rounded-xl xl:scale-95 lg:scale-90 md:scale-75 sm:scale-50"
    >
        {#each ["Groups", "Users"] as item}
            <button
                class="w-1/2 px-6 py-2 text-lg flex justify-center items-center rounded-lg focus:outline-none {selectedItem ===
                item
                    ? 'bg-osvauld-lilacpink text-osvauld-ninjablack'
                    : 'text-osvauld-quarzowhite'} "
                on:click={() => select(item)}
            >
            {#if item === "Groups"}
               <GroupIcon color={selectedItem === "Groups" ? '#0D1117' : '#9399B2'}/>
            {:else}
                <UserIcon color={selectedItem === "Users" ? '#0D1117' : '#9399B2'}/>
            {/if}
                <span class="ml-1">{item}</span>
            </button>
        {/each}
    </div>
</div>
