<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  const select = (permission) => {
    dispatch("select", { permission });
  };
</script>

<div
  class="absolute top-0 right-2 !z-[100] w-[10rem] bg-osvauld-frameblack border-osvauld-bordergreen ml-auto flex flex-col justify-center items-center"
>
  <button
    class="w-full rounded-md cursor-pointer px-2 py-1 bg-osvauld-readerOrange text-osvauld-readerText m-1"
    on:click|stopPropagation={() => select("member")}>Member</button
  >
  <button
    class="w-full rounded-md cursor-pointer px-2 py-1 bg-osvauld-managerPurple text-osvauld-managerText m-1"
    on:click|stopPropagation={() => select("admin")}>Admin</button
  >
</div>
