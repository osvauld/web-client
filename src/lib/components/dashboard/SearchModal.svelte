<script lang="ts">
    import Key from "../basic/icons/key.svelte";
    import LinkIcon from "../basic/icons/linkIcon.svelte";
    import Highlight from "./components/Highlight.svelte";

    export let searchResults = [];
    export let query = "";
    export let handleSearchClick: (result: any) => void;
    export let closeModal: () => void;
</script>

<div
    class="fixed z-10 inset-0 overflow-y-auto backdrop-filter backdrop-blur-[2px] p-4"
>
    <div class="flex items-start justify-center min-h-screen mt-[2.6vh]">
        <button class="fixed inset-0 bg-black opacity-50" on:click={closeModal}>
        </button>
        <div
            class="bg-osvauld-frameblack border border-osvauld-iconblack rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-2xl sm:w-full !w-[40vw] ml-[16vw]"
        >
            <div
                class="w-full border-t-[1px] border-osvauld-iconblack my-2"
            ></div>
            <div class=" bg-osvauld-frameblack">
                {#if searchResults.length !== 0}
                    <p
                        class="text-osvauld-placeholderblack text-sm text-start w-1/2 pl-3"
                    >
                        Showing results for "{query}"
                    </p>
                {/if}
                <div
                    class="max-h-64 min-h-32 overflow-y-auto flex justify-start items-center flex-col mb-4 px-3"
                >
                    {#each searchResults as result}
                        <button
                            on:click={() => handleSearchClick(result)}
                            class="p-2 border rounded-lg border-osvauld-iconblack hover:bg-osvauld-iconblack w-full my-1 flex justify-start items-center"
                        >
                            <div
                                class="h-full flex justify-center items-center scale-150 px-2"
                            >
                                <Key />
                            </div>
                            <div
                                class="w-full flex flex-col justify-center items-start pl-2"
                            >
                                <div class="text-base flex font-semibold">
                                    <Highlight
                                        text={result.name}
                                        {query}
                                    />&nbsp;
                                    <span>in folder</span>&nbsp;
                                    <Highlight
                                        text={result.folderName}
                                        {query}
                                    />
                                </div>
                                <div class="text-sm font-normal">
                                    <Highlight text={result.domain} {query} />
                                </div>
                            </div>
                            <div class="flex justify-center items-center">
                                <LinkIcon />
                            </div>
                        </button>
                    {/each}
                </div>
                {#if searchResults.length === 0}
                    <div
                        class="bg-osvauld-frameblack w-full flex justify-center items-center px-4 mb-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse"
                    >
                        <p
                            class="text-osvauld-placeholderblack text-base text-center w-1/2"
                        >
                            Try searching for keywords in credentials, folders,
                            groups, descriptions and more
                        </p>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>
