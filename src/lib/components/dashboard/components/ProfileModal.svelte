<script lang="ts">
  import EditIcon from "../../basic/icons/editIcon.svelte";
  import { clickOutside } from "../helper";
  import { onMount, onDestroy } from "svelte";
  import { CopyIcon } from "../icons";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let top;
  export let left;
  let isUsernameHovered = false;
  let isRecoveryHovered = false;

  function closeModal() {
    dispatch("close", true);
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeModal();
    }
  };

  const handleClickOutside = () => {
    closeModal();
  };

  const copyUsername = () => {};

  const initiateRecovery = () => {};

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onDestroy(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });
</script>

<div
  class="absolute z-50 bg-osvauld-frameblack border border-osvauld-iconblack w-[14rem] rounded-2xl"
  style="top: {top + 10}px; left: {left - 60}px;"
  use:clickOutside
  on:clickedOutside={handleClickOutside}
>
  <div class="flex flex-col items-start p-2 gap-2 w-full h-full">
    <button
      class="flex items-center p-2 gap-2 w-full h-12 text-osvauld-fieldText hover:text-osvauld-sideListTextActive hover:bg-osvauld-modalFieldActive rounded-lg"
      on:mouseenter={() => (isUsernameHovered = true)}
      on:mouseleave={() => (isUsernameHovered = false)}
      on:click|preventDefault={copyUsername}
    >
      <div class="w-6 h-6 flex items-center justify-center">
        <CopyIcon color={isUsernameHovered ? "#F2F2F0" : "#85889C"} />
      </div>
      <div class="font-inter text-base whitespace-nowrap">Copy username</div>
    </button>

    <button
      class="flex items-center p-2 gap-2 w-full h-12 text-osvauld-fieldText hover:text-osvauld-dangerRed hover:bg-osvauld-modalFieldActive rounded-lg"
      on:mouseenter={() => (isRecoveryHovered = true)}
      on:mouseleave={() => (isRecoveryHovered = false)}
      on:click|preventDefault={initiateRecovery}
    >
      <div class="w-6 h-6 flex items-center justify-center">
        <CopyIcon color={isRecoveryHovered ? "#FF6A6A" : "#85889C"} />
      </div>
      <div class="font-inter text-base whitespace-nowrap">
        Copy recovery data
      </div>
    </button>
  </div>
</div>
