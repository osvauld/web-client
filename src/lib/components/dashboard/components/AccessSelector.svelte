<script>
   export let item;

   import { createEventDispatcher } from "svelte";

   const dispatch = createEventDispatcher();
    const select = (permission, item) => {
        dispatch("select", { permission, item });
    };
</script>


<div class="absolute top-2 right-7 !z-50 w-[8.75rem] h-[6.875rem] bg-osvauld-frameblack border-osvauld-bordergreen  ml-auto flex flex-col justify-center items-center" >
    <button class="w-full rounded-md cursor-pointer px-2 py-1 bg-osvauld-readerOrange text-osvauld-readerText m-1" on:click|stopPropagation={() => select('read', item)}>Read</button>
    <button class="w-full rounded-md cursor-pointer px-2 py-1 bg-osvauld-managerPurple text-osvauld-managerText m-1" on:click|stopPropagation={() => select('write', item)}>Write</button>
    <button class="w-full rounded-md cursor-pointer px-2 py-1 bg-osvauld-ownerGreen text-osvauld-ownerText m-1" on:click|stopPropagation={() => select('owner', item)}>Owner</button>
</div>