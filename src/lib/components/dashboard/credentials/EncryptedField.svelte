<script>
    import { fly } from "svelte/transition";
    import browser from "webextension-polyfill";
    import {
        Locked,
        Eye,
        Unlocked,
        ActiveCopy,
        ClosedEye,
        CopyIcon,
    } from "../icons";
    export let fieldName;
    export let fieldValue;
    export let hoverEffect;
    let visibility = false;
    let decrypted = false;
    let decryptedValue = "";

    const decrypt = async () => {
        const response = await browser.runtime.sendMessage({
            action: "decryptField",
            data: fieldValue,
        });
        decryptedValue = response.data;
        decrypted = true;
    };

    const toggleVisibility = () => {
        visibility = !visibility;
        setTimeout(() => {
            visibility = false;
        }, 3000);
    };
</script>

<div class="mb-4" in:fly out:fly>
    <div
        class="label block mb-2 text-left text-osvauld-dusklabel text-sm font-normal cursor-pointer"
    >
        {fieldName}
    </div>
    <div
        class="relative pr-2 input w-[95%] rounded-lg flex justify-between items-center text-base text-osvauld-sheffieldgrey bg-osvauld-frameblack border border-osvauld-iconblack"
    >
        <div
            class="py-1 px-3 w-full flex justify-between items-center rounded-lg text-base  {hoverEffect
                ? 'text-osvauld-quarzowhite'
                : 'text-osvauld-sheffieldgrey'}"
        >
            {decrypted && visibility ? decryptedValue : "*".repeat(8)}
        </div>
        {#if !decrypted}
            <button on:click={decrypt}>
                <Locked />
            </button>
        {:else}
            <div class="flex justify-center items-center">
                <button>
                    <Unlocked />
                </button>
                <button on:click={toggleVisibility}>
                    {#if visibility}
                        <ClosedEye />
                    {:else}
                        <Eye />
                    {/if}
                </button>
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
