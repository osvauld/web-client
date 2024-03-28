<script>
    import { createEventDispatcher } from "svelte";

    let baseUrl = "";
    const dispatch = createEventDispatcher();

    const handleBaseUrlSubmit = async () => {
        // Save baseUrl to localStorage
        await chrome.storage.local.set({ baseUrl });
        // Dispatch an event to indicate that the base URL has been added to localStorage
        dispatch("baseUrlAdded");
    };

    const handleImportPvtKeyClick = async () => {
        await chrome.storage.local.set({ baseUrl });
        dispatch("importPvtKey", true);
    };
</script>

<form
    class="flex flex-col justify-center items-center"
    on:submit|preventDefault={handleBaseUrlSubmit}
>
    <label for="baseUrl" class="font-normal mt-6">Add the server url</label>
    <div
        class="flex bg-osvauld-frameblack px-3 mt-4 border rounded-lg border-osvauld-iconblack"
    >
        <input
            class="text-white bg-osvauld-frameblack border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0"
            type="text"
            autocomplete="off"
            id="baseUrl"
            bind:value={baseUrl}
        />
    </div>

    <button
        class="bg-osvauld-carolinablue py-2 px-10 mt-8 rounded-lg text-osvauld-ninjablack font-medium w-[150px] flex justify-center items-center whitespace-nowrap"
        type="submit"
    >
        <span>Submit</span>
    </button>
    <button
        class="bg-osvauld-carolinablue py-2 px-10 mt-8 rounded-lg text-osvauld-ninjablack font-medium w-[150px] flex justify-center items-center whitespace-nowrap"
        type="button"
        on:click={handleImportPvtKeyClick}
    >
        <span>Import Pvt Key</span>
    </button>
</form>
