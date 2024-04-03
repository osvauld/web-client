<script lang="ts">
    import BinIcon from "../../basic/icons/binIcon.svelte";
    import EditIcon from "../../basic/icons/editIcon.svelte";
    import Share from "../../basic/icons/share.svelte";

    export let showModal = false;

    let dialog: HTMLDialogElement;

    $: if (dialog && showModal) dialog.showModal();

    function closeModal() {
        showModal = false;
        dialog.close();
    }
</script>

<div class="absolute top-full left-0 z-100">
    <dialog
        bind:this={dialog}
        on:close={() => (showModal = false)}
        on:click|self={closeModal}
        class="bg-gray-900 border border-gray-700 w-44 h-44 m-0 rounded-md"
    >
        <div
            class="flex flex-col items-start p-2 gap-2 w-full h-full"
            on:click|stopPropagation
        >
            <button
                class="flex items-center p-2 gap-4 w-full h-12 bg-gray-800 rounded-lg"
            >
                <div class="w-6 h-6 flex items-center justify-center">
                    <Share />
                </div>
                <div class="font-inter text-lg text-gray-100">Share folder</div>
            </button>
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
    </dialog>
</div>

<style>
    .dialog-container {
        position: absolute;
        top: 100%; /* Position below the button */
        left: 0; /* Align with the left edge of the button */
        z-index: 100; /* Ensure it's above other content */
    }
</style>
