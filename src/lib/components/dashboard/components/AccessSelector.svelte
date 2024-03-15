<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  const select = (permission) => {
    dispatch("select", { permission });
  };
</script>

<div
  class="absolute top-8 right-11 !z-[100] w-[10rem] h-[4rem] bg-osvauld-frameblack border-osvauld-bordergreen ml-auto flex flex-col justify-center items-center"
>
  <button
    class="w-full rounded-md cursor-pointer px-2 py-0.5 bg-osvauld-readerOrange text-osvauld-readerText m-1"
    on:click|stopPropagation={() => select("read")}>Read</button
  >
  <button
    class="w-full rounded-md cursor-pointer px-2 py-0.5 bg-osvauld-managerPurple text-osvauld-managerText m-1"
    on:click|stopPropagation={() => select("write")}>Write</button
  >
  <button
    class="w-full rounded-md cursor-pointer px-2 py-0.5 bg-osvauld-ownerGreen text-osvauld-ownerText m-1"
    on:click|stopPropagation={() => select("owner")}>Owner</button
  >
</div>
