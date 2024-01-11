<script lang="ts">
    import CopyIcon from "../../basic/copyIcon.svelte";
    import { CredentialDetails } from "../dtos";
    import { createEventDispatcher } from "svelte";
    import { fly } from "svelte/transition";
    import { fetchCredentialById } from "../apis";
    import browser from "webextension-polyfill";
  import More from '../../basic/more.svelte';
    const dispatch = createEventDispatcher();

    export let credential;
    let encryptedFields = [];
    const selectCredential = (credential: CredentialDetails) => {
        encryptedFields = [{ fieldName: "test22", fieldValue: "test" }];
    };
    let checked = false;
    function toggleCheck() {
        checked = !checked;
        dispatch("check", checked);
    }
    let hoverTimeout;
    function handleMouseEnter() {
        hoverTimeout = setTimeout(async () => {
            const response = await fetchCredentialById(credential.id);
            encryptedFields = response.data.encryptedFields;
        }, 300);
    }
    function handleMouseLeave() {
        encryptedFields = [];
        clearTimeout(hoverTimeout);
    }

    const decrypt = async (encryptedFieldValue: string, index: number) => {
        const response = await browser.runtime.sendMessage({
            eventName: "decryptField",
            data: encryptedFieldValue,
        });
        encryptedFields[index].fieldValue = response.data;
    };
     /* eslint-disable */
</script>


<div
    class="mb-6 mr-2 flex-none hover:border hover:border-osvauld-activelavender rounded-xl"
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
>
    <button
        class="container mx-auto p-4 relative group bg-osvauld-frameblack rounded-xl"
        on:click={toggleCheck}
        on:keydown={(e) => {
            if (e.key === "Enter") {
                toggleCheck();
            }
        }}
    >
        <div class="flex justify-between items-center border-b-2 border-osvauld-iconblack pb-2">
            <input type="checkbox" class="bg-osvauld-frameblack mr-2 border-osvauld-iconblack" on:change={(e) => toggleCheck()} />
            <p class="text-xl font-medium">{credential.name}</p>
            <More />
        </div>
        <div class="overflow-y-auto max-h-[280px] min-h-[280px] scrollbar-thin mt-2">
            {#each credential?.unencryptedFields as field, index}
                <div class="mb-4">
                    <label
                        class="label block mb-2 text-left"
                        for={`input-${index}`}>{field.fieldName}</label
                    >
                    <div class="relative">
                        <input
                            class={`input pr-10 w-full rounded-2xl items-center bg-osvauld-frameblack border-osvauld-iconblack`}
                            type="text"
                            value={field.fieldValue}
                        />
                        <button
                            class="absolute right-2 top-1/2 transform -translate-y-1/2"
                        >
                            <CopyIcon />
                        </button>
                    </div>
                </div>
            {/each}
            {#if encryptedFields}
                {#each encryptedFields as field, index}
                    <div class="mb-4" in:fly out:fly>
                        <label
                            class="label block mb-2 text-left"
                            for={`input-${index}`}>{field.fieldName}</label
                        >
                        <div class="relative">
                            <input
                                class={`input pr-10 w-full rounded-2xl items-center bg-osvauld-frameblack border-osvauld-iconblack`}
                                type="text"
                                value={field.fieldValue}
                            />
                            <button
                                on:click={() =>
                                    decrypt(field.fieldValue, index)}
                                class="bg-red-400 absolute right-2 top-1/2 transform -translate-y-1/2"
                            >
                                Decrypt
                            </button>
                            <button
                                class="absolute right-2 top-1/2 transform -translate-y-1/2"
                            >
                                <CopyIcon />
                            </button>
                        </div>
                    </div>
                {/each}
            {/if}
        </div>
        <!-- Static description at the bottom -->
        <textarea
            class="mt-4 w-full h-auto min-h-[4rem] max-h-[10rem] bg-osvauld-frameblack rounded-md scrollbar-thin border-osvauld-iconblack resize-none"
            >{credential.description}</textarea
        >
    </button>
</div>
