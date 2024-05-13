<script lang="ts">
    import { onMount, onDestroy, createEventDispatcher } from "svelte";
    import {
        getSearchFields,
        fetchCredentialsFieldsByIds,
        shareCredentialsWithEnv,
    } from "../apis";
    import { fly } from "svelte/transition";
    import { ClosePanel } from "../icons";
    import { searchObjects, sendMessage } from "../helper";
    import { Lens } from "../icons";
    import { selectedEnv } from "../store";

    let saveEnabled = false;
    let query = "";

    const dispatch = createEventDispatcher();

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            dispatch("close");
        }
    };
    let searchData = [];
    let searchResults = [];
    let checkedCredentials = new Set();

    function toggleFolder(result, event) {
        if (event.target.checked) {
            checkedCredentials.add(result);
        } else {
            checkedCredentials.delete(result);
        }
        if (checkedCredentials.size === 0) {
            saveEnabled = false;
        } else if (checkedCredentials.size > 0 && !saveEnabled) {
            saveEnabled = true;
        }
    }
    const getSearchData = async () => {
        const searchFieldSResponse = await getSearchFields();
        searchData = searchFieldSResponse.data;
        searchResults = searchData;
    };
    const handleInputChange = (e: any) => {
        const query = e.type === "input" ? e.target.value : e.detail;
        searchResults =
            query.length >= 1 ? searchObjects(query, searchData) : [];
    };

    const addCredentialToEnv = async () => {
        const credentialIds = Array.from(checkedCredentials).map(
            (credential: any) => credential.credentialId,
        );
        const responseJson = await fetchCredentialsFieldsByIds(credentialIds);
        const encryptedCreds = await sendMessage("createShareCredPayload", {
            creds: responseJson.data,
            users: [
                {
                    id: $selectedEnv.cliUser,
                    publicKey: $selectedEnv.publicKey,
                },
            ],
        });
        encryptedCreds[0].envId = $selectedEnv.id;
        await shareCredentialsWithEnv(encryptedCreds[0]);
        dispatch("close");
    };

    onMount(async () => {
        window.addEventListener("keydown", handleKeyDown);
        await getSearchData();
    });

    onDestroy(() => {
        window.removeEventListener("keydown", handleKeyDown);
    });
</script>

<div
    class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex justify-end rounded-2xl border border-osvauld-activeBorder blur-none"
    in:fly
    out:fly
>
    <div
        class="w-[32.25rem] min-h-[34.375rem] max-h-[37rem] rounded-2xl translate-x-0 bg-osvauld-frameblack p-7 flex flex-col"
    >
        <div class="flex justify-between items-center p-3 pt-0">
            <span
                class="font-sans text-osvauld-quarzowhite text-xl font-normal flex justify-center items-center"
                >Add creds

                <button class="p-2" on:click={() => dispatch("close")}
                    ><ClosePanel /></button
                >
            </span>
        </div>
        <div
            class="h-[2.2rem] w-[31.25rem] px-2 mx-auto flex justify-start items-center border border-osvauld-iconblack focus-within:border-osvauld-activeBorder rounded-lg cursor-pointer"
        >
            <Lens />
            <input
                type="text"
                class="h-[2rem] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
                placeholder="Search.."
                on:click={getSearchData}
                on:input={handleInputChange}
                bind:value={query}
                on:keyup={handleKeyDown}
            />
        </div>
        <div class="overflow-y-scroll scrollbar-thin h-[20rem]">
            <ul>
                {#each searchResults as result}
                    <li
                        class="py-1 px-1 overflow-hidden text-osvauld-sheffieldgrey rounded-md hover:text-osvauld-textActive hover:border hover:border-osvauld-borderColor"
                    >
                        <label
                            class="flex items-center justify-start w-full text-left"
                        >
                            <input
                                type="checkbox"
                                class="mr-2"
                                on:change={(event) =>
                                    toggleFolder(result, event)}
                            />
                            <span class="text-base">
                                {result.name}
                            </span>
                        </label>
                    </li>
                {/each}
            </ul>
        </div>
        <div class="p-2 w-full flex justify-end items-center box-border mt-0">
            <button
                class="ml-auto p-2 whitespace-nowrap text-sm font-medium text-osvauld-fadedCancel"
                on:click={() => dispatch("close")}>Cancel</button
            >

            <button
                class="ml-4 px-3 py-2 whitespace-nowrap text-sm font-medium rounded-md {saveEnabled
                    ? 'bg-osvauld-carolinablue text-osvauld-frameblack border-transparent'
                    : 'border border-osvauld-iconblack text-osvauld-textActive'}"
                disabled={!saveEnabled}
                on:click={addCredentialToEnv}>Add</button
            >
        </div>
    </div>
</div>
