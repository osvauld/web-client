<script lang="ts">
    import CopyIcon from "../../basic/copyIcon.svelte";
    import { CredentialDetails } from "../dtos";
    import { createEventDispatcher } from "svelte";
    import { fly } from "svelte/transition";
    import { fetchCredentialById } from "../apis";
    import browser from "webextension-polyfill";
    import More from '../../basic/more.svelte';
    import Locked from '../../basic/locked.svelte';
    import Eye from '../../basic/eye.svelte';
    import Unlocked from '../../basic/unlocked.svelte';
    import SensitiveEye from '../../basic/sensitiveEye.svelte';
    import SensitiveEye2 from '../../basic/sensitiveEyeBlue.svelte';
    import ActiveCopy from '../../basic/activeCopy.svelte';
    import ClosedEye from '../../basic/closedEye.svelte';
    const dispatch = createEventDispatcher();

    export let credential;
    let visibility = false;
    let encryptedFields = [];
    let decrypted = false;
    let checked = false;
    let hoverEffect = false;
    let hoverTimeout;

    function toggleCheck() {
        checked = !checked;
        dispatch("check", checked);
    }
    function handleMouseEnter() {
        hoverEffect = true;
        if(!decrypted){
            hoverTimeout = setTimeout(async () => {
            const response = await fetchCredentialById(credential.id);
            encryptedFields = response.data.encryptedFields;
            encryptedFields = encryptedFields.map(item => ({ ...item, lockIcon: true }));
        }, 300);
        }
    }
    function handleMouseLeave() {
        encryptedFields = [];
        clearTimeout(hoverTimeout);
        decrypted = false;
        hoverEffect = false;
    }

    function makeVisible(){
        if(visibility){
            visibility = false;
        } else {
            visibility = true;
            setTimeout(()=> {
                visibility = false;
            }, 3000)
        }
       
    }

    const decrypt = async (encryptedFieldValue: string, index: number) => {

        const response = await browser.runtime.sendMessage({
            eventName: "decryptField",
            data: encryptedFieldValue,
        });
        encryptedFields[index].fieldValue = response.data;
        encryptedFields[index].lockIcon = false;
        decrypted = true;
    };
     /* eslint-disable */
</script>


<div
    class="mb-3 flex-none hover:border hover:border-osvauld-activelavender rounded-xl text-osvauld-chalkwhite xl:scale-95 lg:scale-90 md:scale-90 sm:scale-75 "
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
  
        <div class="flex justify-center items-center border-osvauld-iconblack pb-2">
            <input type="checkbox" class="bg-osvauld-frameblack mr-2 border-osvauld-iconblack checked:bg-osvauld-lilacpink active:outline-none focus:text-primary focus:ring-offset-0 focus:ring-0 cursor-pointer" on:change={(e) => toggleCheck()} />
            <p class="text-xl font-medium w-full text-left ml-2">{credential.name}</p>
            <More />
        </div>
        <div class="border-b border-osvauld-bordergreen w-[calc(100%+32px)] -translate-x-4 "></div>
        <div class="w-[240px] h-[170px] overflow-scroll .scrollbar-thin::-webkit-scrollbar .scrollbar-thin::-webkit-scrollbar-thumb:hover mt-2">
            {#each credential?.unencryptedFields as field, index}
                <div class="mb-4">
                    <label
                        class="label block mb-2 text-left text-osvauld-dusklabel text-sm font-normal"
                        for={`input-${index}`}>{field.fieldName}</label
                    >
                    <div class="relative">
                        <input
                        class={`input pr-10 w-full rounded-lg items-center text-base bg-osvauld-frameblack border-osvauld-iconblack ${hoverEffect ? 'text-osvauld-quarzowhite' : 'text-osvauld-sheffieldgrey'}`}
                        type="text"
                        value={field.fieldValue}
                      />
                      
                        <button
                            class="absolute right-2 top-1/2 transform -translate-y-1/2"
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
                        <div class="relative pr-2 input w-full rounded-lg flex justify-between items-center text-base text-osvauld-sheffieldgrey bg-osvauld-frameblack border border-osvauld-iconblack">
                            <input
                                class={`text-osvauld-sheffieldgrey bg-osvauld-frameblack border-0 w-2/3`}
                                type={`${!field.lockIcon && visibility ? "text": "password"}`}
                                value={field.fieldValue}
                            />
                            <!-- If decrypt in not clicked yet -->
                            {#if field.lockIcon}
                                <button on:click={() => decrypt(field.fieldValue, index)}>
                                    <Locked/>
                                </button>
                           {:else}
                            <div class="flex justify-center items-center">
                                <!-- Unlocked Button -->
                                <button>
                                    <Unlocked/>
                                </button>
                        
                                <!-- Visibility Toggle Button -->
                                <button on:click={makeVisible}>
                                    {#if visibility}
                                        <ClosedEye/>
                                    {:else}
                                        <Eye/>
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
        <!-- Static description at the bottom -->
        <label class="text-osvauld-dusklabel block text-left text-sm font-normal">
            Description
        </label>
        <textarea
        class="mt-4 w-full h-auto min-h-[4rem] max-h-[10rem] bg-osvauld-frameblack rounded-lg scrollbar-thin border-osvauld-iconblack resize-none text-base 
        {hoverEffect ? 'text-osvauld-quarzowhite' : 'text-osvauld-sheffieldgrey'}"
      >
        {credential.description}
      </textarea>
      
     
        <div class="border-t border-osvauld-bordergreen w-[calc(100%+32px)] -translate-x-4 my-2"></div>
        <div class="flex justify-start">
            <span class="{ hoverEffect ? 'bg-osvauld-sensitivebgblue text-osvauld-carolinablue' : 'bg-osvauld-sensitivebgblack text-osvauld-chalkwhite'} py-0 px-3 text-sm border border-osvauld-bordergreen rounded-[4px] flex justify-center items-center">
                {#if hoverEffect}
                    <SensitiveEye2 />
                {:else}
                    <SensitiveEye />
                {/if}
                <span class="ml-2 { hoverEffect ? 'text-osvauld-carolinablue' : 'text-osvauld-placeholderblack'}">Sensitive Fields</span>
            </span>
        </div>
        
    </button>
</div>
