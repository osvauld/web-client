<script>
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
    let selectedItem = "Groups";
    const select = (item) => {
        selectedItem = item;
        console.log(item);
        dispatch("select", item);
    };
</script>

<div class="flex justify-center">
    <div
        class="inline-flex justify-center space-x-1 p-1 bg-osvauld-ninjablack border-2 border-osvauld-bordergreen rounded-xl xl:scale-95 lg:scale-90 md:scale-75 sm:scale-50"
    >
        {#each ["Groups", "Users"] as item}
            <button
                class="w-1/2 px-6 py-2 text-lg flex justify-center items-center rounded-lg focus:outline-none {selectedItem ===
                item
                    ? 'bg-osvauld-lilacpink text-osvauld-ninjablack'
                    : 'text-osvauld-quarzowhite'} "
                on:click={() => select(item)}
            >
                {item}
            </button>
        {/each}
    </div>
</div>
