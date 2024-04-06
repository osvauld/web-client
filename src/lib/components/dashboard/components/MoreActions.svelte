<script lang="ts">
  import BinIcon from "../../basic/icons/binIcon.svelte";
  import EditIcon from "../../basic/icons/editIcon.svelte";
  import { FolderShare } from "../icons";
  import {
    buttonRef,
    showMoreOptions,
    DeleteConfirmationModal,
    menuForFolder,
    CredentialWillbeDeleted,
  } from "../store";
  import { clickOutside } from "../helper";
  import { derived } from "svelte/store";
  import { onMount, onDestroy } from "svelte";

  let isShareHovered = false;
  let isEditHovered = false;
  let isBinHovered = false;

  function closeModal() {
    showMoreOptions.set(false);
    menuForFolder.set({});
    CredentialWillbeDeleted.set({});
  }

  export const buttonCoords = derived(buttonRef, ($buttonRef) => {
    if ($buttonRef) {
      const rect = $buttonRef.getBoundingClientRect();
      const leftVal = $menuForFolder.folderId
        ? rect.left + window.scrollX
        : rect.left + window.scrollX - 3.5 * rect.width;
      return {
        top: rect.top + window.scrollY + rect.height,
        left: leftVal,
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

  const deleteInitiate = () => {
    showMoreOptions.set(false);
    buttonRef.set(null);
    DeleteConfirmationModal.set(true);
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onDestroy(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });
</script>

{#if $showMoreOptions && $buttonRef}
  <div
    class="absolute z-50 bg-osvauld-frameblack border border-osvauld-iconblack {$menuForFolder.folderId
      ? 'w-[166px]'
      : 'w-[130px]'} rounded-2xl"
    style="top: {$buttonCoords.top}px; left: {$buttonCoords.left}px;"
    use:clickOutside
    on:clickedOutside={handleClickOutside}
  >
    <div class="flex flex-col items-start p-2 gap-2 w-full h-full">
      <button
        class="flex justify-start gap-2 items-center w-full p-2 text-osvauld-fieldText hover:text-osvauld-sideListTextActive hover:bg-osvauld-modalFieldActive rounded-lg cursor-pointer"
        on:mouseenter={() => (isShareHovered = true)}
        on:mouseleave={() => (isShareHovered = false)}
      >
        <FolderShare color={isShareHovered ? "#F2F2F0" : "#85889C"} />
        <div class="font-inter text-base whitespace-nowrap">
          Share {$menuForFolder.folderId ? "folder" : ""}
        </div>
      </button>

      <button
        class="flex items-center p-2 gap-2 w-full h-12 text-osvauld-fieldText hover:text-osvauld-sideListTextActive hover:bg-osvauld-modalFieldActive rounded-lg"
        on:mouseenter={() => (isEditHovered = true)}
        on:mouseleave={() => (isEditHovered = false)}
      >
        <div class="w-6 h-6 flex items-center justify-center">
          <EditIcon color={isEditHovered ? "#F2F2F0" : "#85889C"} />
        </div>
        <div class="font-inter text-base whitespace-nowrap">Rename</div>
      </button>

      <button
        class="flex items-center p-2 gap-2 w-full h-12 text-osvauld-fieldText hover:text-osvauld-sideListTextActive hover:bg-osvauld-modalFieldActive rounded-lg"
        on:mouseenter={() => (isBinHovered = true)}
        on:mouseleave={() => (isBinHovered = false)}
        on:click|preventDefault={deleteInitiate}
      >
        <div class="w-6 h-6 flex items-center justify-center">
          <BinIcon color={isBinHovered ? "#F2F2F0" : "#85889C"} />
        </div>
        <div class="font-inter text-base whitespace-nowrap">
          Delete {$menuForFolder.folderId ? "folder" : ""}
        </div>
      </button>
    </div>
  </div>
{/if}
