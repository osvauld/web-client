<script>
  import { BlueClose } from "../icons";

  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  const triggerCloseEvent = () => {
    dispatch("close");
  };
</script>

<div
  class="w-full px-4 py-5 my-2 rounded-lg bg-osvauld-bordergreen text-osvauld-quarzowhite font-normal text-xl flex justify-between items-center !z-50"
>
  <span class="ml-2"> Successfully shared!</span>
  <button
    class="border-0 bg-osvauld-toastCloseBlue rounded-lg flex justify-center items-center p-2 mr-5"
    on:click={triggerCloseEvent}
  >
    <BlueClose /></button
  >
</div>
