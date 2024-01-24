<script lang="ts">
    import CopyIcon from "../../basic/copyIcon.svelte";
    import { Credential } from "../dtos";
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    import { fly } from "svelte/transition";
    import {
        fetchCredentialById,
        fetchSensitiveFieldsByCredentialId,
    } from "../apis";
    import browser from "webextension-polyfill";
    import { More, Locked, Eye, Unlocked, SensitiveEye, SensitiveEyeBlue, ActiveCopy, ClosedEye } from "../icons"


    const dispatch = createEventDispatcher();

    export let credential;
    export let index;

    let visibility = false;
    let encryptedFields = [];
    let decrypted = false;
    let checked = false;
    let hoverEffect = false;
    let sensitiveCard = false;
    let hoverTimeout;

    function toggleCheck() {
        checked = !checked;
        dispatch("check", checked);
    }
    function handleMouseEnter() {
        hoverEffect = true;
        if (!decrypted) {
            hoverTimeout = setTimeout(async () => {
                const response = await fetchSensitiveFieldsByCredentialId(
                    credential.credentialId,
                );
                encryptedFields = response.data;
                encryptedFields.length >= 1
                    ? (sensitiveCard = true)
                    : (sensitiveCard = false);
                encryptedFields = encryptedFields.map((item) => ({
                    ...item,
                    lockIcon: true,
                }));
            }, 300);
        }
    }
    function handleMouseLeave() {
        encryptedFields = [];
        clearTimeout(hoverTimeout);
        decrypted = false;
        hoverEffect = false;
        sensitiveCard = false;
    }

    function makeVisible() {
        visibility = !visibility;
        setTimeout(() => {
            visibility = false;
        }, 3000);
    }

    const decrypt = async (encryptedFieldValue: string, index: number) => {
        const response = await browser.runtime.sendMessage({
            action: "decryptField",
            data: encryptedFieldValue,
        });
        encryptedFields[index].fieldValue = response.data;
        encryptedFields[index].lockIcon = false;
        decrypted = true;
    };
    onMount(async () => {
        checked = false;
    });

    /* eslint-disable */
</script>

<div
    class="mb-3 flex-none hover:border hover:border-osvauld-activelavender rounded-xl text-osvauld-chalkwhite xl:scale-95 lg:scale-90 md:scale-90 sm:scale-75"
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
>
    <button
        class="container mx-auto p-3 relative group bg-osvauld-frameblack rounded-xl"
    >
        <div
            class="flex justify-center items-center border-osvauld-iconblack pb-2"
        >
            <input
                type="checkbox"
                id="credentialChecker{index}"
                class="bg-osvauld-frameblack mr-2 border-osvauld-iconblack checked:bg-osvauld-lilacpink active:outline-none focus:text-primary focus:ring-offset-0 focus:ring-0 cursor-pointer"
                on:change={(e) => toggleCheck()}
                {checked}
            />
            <label class="text-xl font-medium w-full text-left ml-2 cursor-pointer" for="credentialChecker{index}" >
                {credential.name}
            </label>
            <More />
        </div>
        <div
            class="border-b border-osvauld-bordergreen w-[calc(100%+24px)] -translate-x-3"
        ></div>
        <div
            class="w-[260px] h-[240px] overflow-y-scroll scrollbar-thin {hoverEffect
                ? 'active'
                : ''} mt-2"
        >
            {#each credential?.fields as field, index}
                <div class="mb-4">
                    <label
                        class="label block mb-2 text-left text-osvauld-dusklabel text-sm font-normal"
                        for={`input-${index}`}>{field.fieldName}</label
                    >
                    <div class="relative">
                        <input
                            class={`input py-1 pr-10 w-[95%] rounded-lg items-center text-base bg-osvauld-frameblack border-osvauld-iconblack ${
                                hoverEffect
                                    ? "text-osvauld-quarzowhite"
                                    : "text-osvauld-sheffieldgrey"
                            }`}
                            type="text"
                            value={field.fieldValue}
                        />

                        <button
                            class="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                            {#if hoverEffect}
                                <ActiveCopy />
                            {:else}
                                <CopyIcon />
                            {/if}
                        </button>
                    </div>
                </div>
            {/each}
            {#if encryptedFields}
                {#each encryptedFields as field, index}
                    <div class="mb-4" in:fly out:fly>
                        <label
                            class="label block mb-2 text-left text-osvauld-dusklabel text-sm font-normal"
                            for={`input-${index}`}>{field.fieldName}</label
                        >
                        <div
                            class="relative pr-2 input w-[95%] rounded-lg flex justify-between items-center text-base text-osvauld-sheffieldgrey bg-osvauld-frameblack border border-osvauld-iconblack"
                        >
                            <input
                                class={`text-osvauld-sheffieldgrey bg-osvauld-frameblack border-0 rounded-lg py-1 w-2/3`}
                                type={`${
                                    !field.lockIcon && visibility
                                        ? "text"
                                        : "password"
                                }`}
                                value={field.fieldValue}
                            />
                            <!-- If decrypt in not clicked yet -->
                            {#if field.lockIcon}
                                <button
                                    on:click={() =>
                                        decrypt(field.fieldValue, index)}
                                >
                                    <Locked />
                                </button>
                            {:else}
                                <div class="flex justify-center items-center">
                                    <!-- Unlocked Button -->
                                    <button>
                                        <Unlocked />
                                    </button>

                                    <!-- Visibility Toggle Button -->
                                    <button on:click={makeVisible}>
                                        {#if visibility}
                                            <ClosedEye />
                                        {:else}
                                            <Eye />
                                        {/if}
                                    </button>

                                    <!-- Copy Button -->
                                    <button>
                                        {#if hoverEffect}
                                            <ActiveCopy />
                                        {:else}
                                            <CopyIcon />
                                        {/if}
                                    </button>
                                </div>
                            {/if}
                        </div>
                    </div>
                {/each}
            {/if}
        </div>
        <label
            class="text-osvauld-dusklabel block text-left text-sm font-normal"
        >
            Description
        </label>
        <textarea
            class="mt-4 w-full h-auto min-h-[4rem] max-h-[10rem] bg-osvauld-frameblack rounded-lg scrollbar-thin border-osvauld-iconblack resize-none text-base
            {hoverEffect
                    ? 'text-osvauld-quarzowhite'
                    : 'text-osvauld-sheffieldgrey'}"
            
            value={credential.description}
            />

        <div
            class="border-t border-osvauld-bordergreen w-[calc(100%+24px)] -translate-x-3 my-2"
        ></div>
        <div class="flex justify-start">
            <span
                class="{hoverEffect && sensitiveCard
                    ? 'bg-osvauld-sensitivebgblue text-osvauld-carolinablue'
                    : 'bg-osvauld-sensitivebgblack text-osvauld-chalkwhite'} py-0 px-3 text-sm border border-osvauld-bordergreen rounded-[4px] flex justify-center items-center"
            >
                {#if hoverEffect && sensitiveCard}
                    <SensitiveEyeBlue />
                {:else}
                    <SensitiveEye />
                {/if}
                <span
                    class="ml-2 {hoverEffect && sensitiveCard
                        ? 'text-osvauld-carolinablue'
                        : 'text-osvauld-placeholderblack'}"
                    >Sensitive Fields</span
                >
            </span>
        </div>
    </button>
</div>
