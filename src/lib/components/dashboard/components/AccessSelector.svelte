<script lang="ts">
  import { DownArrow } from "../icons";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  const select = (permission) => {
    dispatch("select", { permission });
  };
</script>

<div
  class="absolute top-0 right-0 !z-[100] w-[10rem] px-0.5 py-0 rounded-md bg-osvauld-frameblack border-[0.5px] border-osvauld-iconblack ml-auto text-base font-normal flex flex-col justify-center items-center"
>
  <span
    class=" text-osvauld-permissionGreenText bg-osvauld-permissionsGreen w-full rounded-md cursor-pointer px-2 py-0.5 mt-0.5 flex justify-around items-center"
    >Permissions <span><DownArrow type={"indicator"} /></span></span
  >
  <button
    class="w-full rounded-md cursor-pointer px-2 py-0.5 bg-osvauld-readerOrange text-osvauld-readerText mt-0.5"
    on:click|stopPropagation={() => select("reader")}>Reader</button
  >
  <button
    class="w-full rounded-md cursor-pointer px-2 py-0.5 bg-osvauld-managerPurple text-osvauld-managerText my-0.5"
    on:click|stopPropagation={() => select("manager")}>Manager</button
  >
</div>
