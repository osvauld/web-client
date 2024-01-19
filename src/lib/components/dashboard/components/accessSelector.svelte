<script>
   export let user;

   import { createEventDispatcher } from "svelte";

   const dispatch = createEventDispatcher();
    const select = (permission, user) => {
        dispatch("select", {permission, user});
    };
</script>


<div class="absolute top-2 right-7 !z-50 w-[140px] h-[110px] bg-osvauld-frameblack border-osvauld-bordergreen  ml-auto flex flex-col justify-center items-center" >
    <button class="w-full rounded-md cursor-pointer px-2 py-1 bg-osvauld-readerOrange text-osvauld-readerText m-1" on:click|stopPropagation={() => select('read', user)}>Read</button>
    <button class="w-full rounded-md cursor-pointer px-2 py-1 bg-osvauld-managerPurple text-osvauld-managerText m-1" on:click|stopPropagation={() => select('write', user)}>Write</button>
    <button class="w-full rounded-md cursor-pointer px-2 py-1 bg-osvauld-ownerGreen text-osvauld-ownerText m-1" on:click|stopPropagation={() => select('owner', user)}>Owner</button>
</div>