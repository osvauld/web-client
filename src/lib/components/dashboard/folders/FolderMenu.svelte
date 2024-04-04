<script lang="ts">
    import BinIcon from "../../basic/icons/binIcon.svelte";
    import EditIcon from "../../basic/icons/editIcon.svelte";
    import Share from "../../basic/icons/share.svelte";
    import { buttonRef, showFolderMenu } from "../store";
    import { clickOutside } from "../helper";
    import { derived } from "svelte/store";
    import { onMount, onDestroy } from "svelte";

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
        class="absolute z-50 bg-gray-900 border border-gray-700 w-44 rounded-md"
        style="top: {$buttonCoords.top}px; left: {$buttonCoords.left}px;"
        use:clickOutside
        on:clickedOutside={handleClickOutside}
    >
        <div class="flex flex-col items-start p-2 gap-2 w-full h-full">
            <div class="w-6 h-6 flex items-center justify-center">
                <Share />
            </div>
            <div class="font-inter text-lg text-gray-100">Share folder</div>
            <button class="flex items-center p-2 gap-4 w-full h-12 rounded-lg">
                <div class="w-6 h-6 flex items-center justify-center">
                    <EditIcon />
                </div>
                <div class="font-inter text-lg text-gray-400">Rename</div>
            </button>
            <button class="flex items-center p-2 gap-4 w-full h-12 rounded-lg">
                <div class="w-6 h-6 flex items-center justify-center">
                    <BinIcon />
                </div>
                <div class="font-inter text-lg text-gray-400">
                    Delete folder
                </div>
            </button>
        </div>
    </div>
{/if}
