<script>
    import { setbackground } from "../helper";
    import BinIcon from "../../basic/icons/binIcon.svelte";
    export let item;
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    const handleItemRemove = () => {
        dispatch("remove");
    };
</script>

<div
    class="relative w-full my-2 px-2 border border-osvauld-bordergreen rounded-lg cursor-pointer flex items-center justify-between"
>
    <div class="flex items-center space-x-4">
        <p class="p-2 w-3/4 whitespace-nowrap">{item.name}</p>
    </div>
    <div class="flex justify-center items-center">
        <button
            class="w-[6.25rem] rounded-md cursor-pointer px-2 py-1 pl-2 flex justify-center items-center {setbackground(
                item.accessType,
            )}"
            >{item.accessType}
        </button>
        <button class="p-2" on:click={handleItemRemove}>
            <BinIcon />
        </button>
    </div>
</div>
