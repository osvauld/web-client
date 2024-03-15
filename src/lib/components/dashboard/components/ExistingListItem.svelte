<script>
    import { setbackground } from "../helper";
    import BinIcon from "../../basic/icons/binIcon.svelte";
    export let item;
    import { createEventDispatcher } from "svelte";
    import AccessSelector from "./AccessSelector.svelte";
    const dispatch = createEventDispatcher();

    let changePermission = false;
    const handleItemRemove = () => {
        dispatch("remove");
    };
    const eventPasser = (e) => {
        item = { ...item, accessType: e.detail.permission };
        changePermission = !changePermission;
        console.log(e.detail.permission);
        dispatch("permissonChange", e.detail.permission);
    };
    const changePermissionHandler = () => {
        changePermission = !changePermission;
    };
</script>

<div
    class="relative w-full my-2 px-2 border border-osvauld-bordergreen rounded-lg cursor-pointer flex items-center justify-between"
>
    <div class="flex items-center space-x-4">
        <p class="p-2 w-3/4 whitespace-nowrap">{item.name}</p>
    </div>
    <div class="flex justify-center items-center">
        {#if !changePermission}
            <button
                class="w-[6.25rem] rounded-md cursor-pointer px-2 py-1 pl-2 flex justify-center items-center {setbackground(
                    item.accessType,
                )}"
                on:click={changePermissionHandler}
                >{item.accessType}
            </button>
        {:else}
            <AccessSelector on:select={(e) => eventPasser(e)} />
        {/if}
        <button class="p-2" on:click={handleItemRemove}>
            <BinIcon />
        </button>
    </div>
</div>
