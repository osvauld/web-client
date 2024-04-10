<script lang="ts">
  import { onMount } from "svelte";
  import { BlueClose } from "../icons";
  import { toastStore } from "../store";

  const triggerCloseEvent = () => {
    toastStore.set({ show: false, message: "", type: null });
  };
  // onMount(() => {
  //   setTimeout(() => {
  //     triggerCloseEvent();
  //   }, 1000);
  // });
</script>

<div
  class="fixed inset-0 flex items-center justify-center z-500 px-4 py-5 my-2 rounded-lg bg-osvauld-bordergreen text-osvauld-quarzowhite font-normal text-xl"
>
  <div
    class="justify-between items-center rounded-lg bg-osvauld-bordergreen text-osvauld-quarzowhite font-normal text-xl px-4 py-5 my-2"
  >
    <span class="ml-2 text-base font-sans"> {$toastStore.message}!</span>
    <button
      class="border-0 bg-osvauld-toastCloseBlue rounded-lg justify-center items-center p-2 mr-5"
      on:click={triggerCloseEvent}
    >
      <BlueClose /></button
    >
  </div>
</div>
