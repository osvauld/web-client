<script lang="ts">
  import BinIcon from "../../basic/icons/binIcon.svelte";
  import EditIcon from "../../basic/icons/editIcon.svelte";
  import Share from "../../basic/icons/share.svelte";
  import { buttonRef, showFolderMenu } from "../store";
  import { clickOutside } from "../helper";
  import { derived } from "svelte/store";
  import { onMount, onDestroy } from "svelte";

  let isShareHovered = false;
  let isEditHovered = false;
  let isBinHovered = false;

  function closeModal() {
    showFolderMenu.set(false);
  }

  export const buttonCoords = derived(buttonRef, ($buttonRef) => {
    if ($buttonRef) {
      const rect = $buttonRef.getBoundingClientRect();
      return {
        top: rect.top + window.scrollY + rect.height,
        left: rect.left + window.scrollX,
      };
    }
    return { top: 0, left: 0 };
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeModal();
    }
  };

  const handleClickOutside = () => {
    closeModal();
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onDestroy(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });
</script>

{#if $showFolderMenu && $buttonRef}
  <div
    class="absolute z-50 bg-osvauld-frameblack border border-osvauld-iconblack w-44 rounded-md"
    style="top: {$buttonCoords.top}px; left: {$buttonCoords.left}px;"
    use:clickOutside
    on:clickedOutside={handleClickOutside}
  >
    <div class="flex flex-col items-start p-2 gap-2 w-full h-full">
      <button
        class="flex justify-start gap-4 items-center w-full p-2 text-osvauld-fieldText hover:text-osvauld-fieldTextActive cursor-pointer"
        on:mouseenter={() => (isShareHovered = true)}
        on:mouseleave={() => (isShareHovered = false)}
      >
        <Share color={isShareHovered ? "#BFC0CC" : "#85889C"} />
        <div class="font-inter text-base">Share folder</div>
      </button>

      <button
        class="flex items-center p-2 gap-4 w-full h-12 rounded-lg text-osvauld-fieldText hover:text-osvauld-fieldTextActive"
        on:mouseenter={() => (isEditHovered = true)}
        on:mouseleave={() => (isEditHovered = false)}
      >
        <div class="w-6 h-6 flex items-center justify-center">
          <EditIcon color={isEditHovered ? "#BFC0CC" : "#85889C"} />
        </div>
        <div class="font-inter text-base">Rename</div>
      </button>

      <button
        class="flex items-center p-2 gap-4 w-full h-12 rounded-lg text-osvauld-fieldText hover:text-osvauld-fieldTextActive"
        on:mouseenter={() => (isBinHovered = true)}
        on:mouseleave={() => (isBinHovered = false)}
      >
        <div class="w-6 h-6 flex items-center justify-center">
          <BinIcon color={isBinHovered ? "#BFC0CC" : "#85889C"} />
        </div>
        <div class="font-inter text-base">Delete folder</div>
      </button>
    </div>
  </div>
{/if}
