<script lang="ts">
    import BinIcon from "../../basic/icons/binIcon.svelte";
    import EditIcon from "../../basic/icons/editIcon.svelte";
    import Share from "../../basic/icons/share.svelte";
</script>

<div
    class="bg-gray-900 border border-gray-700 rounded-2xl w-44 h-44 absolute top-0 left-0 z-100 m-0"
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
            <div class="font-inter text-lg text-gray-400">Delete folder</div>
        </button>
    </div>
</div>
