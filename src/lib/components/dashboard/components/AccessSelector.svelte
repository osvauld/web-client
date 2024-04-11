<script lang="ts">
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  const select = (permission) => {
    dispatch("select", { permission });
  };
</script>

<div
  class="absolute top-0 right-0 !z-[100] w-[10rem] px-1 rounded-md bg-osvauld-frameblack border-[0.5px] border-osvauld-iconblack ml-auto flex flex-col justify-center items-center"
>
  <button
    class="w-full rounded-md cursor-pointer px-2 py-0 bg-osvauld-readerOrange text-osvauld-readerText mt-1"
    on:click|stopPropagation={() => select("reader")}>Read</button
  >
  <button
    class="w-full rounded-md cursor-pointer px-2 py-0 bg-osvauld-managerPurple text-osvauld-managerText my-1"
    on:click|stopPropagation={() => select("manager")}>Manage</button
  >
</div>
