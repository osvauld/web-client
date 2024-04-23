<script>
    import { fetchAllFolders } from "../dashboard/apis";
    export let username = "";
    export let password = "";
    export let domain = "";
    let name = "";
    let description = "";
    let showFolderList = false;
    let folderData = [];

    // Function to handle form submission
    const handleSubmit = async () => {
        const credential = { username, password, domain, name, description };

        const responseJson = await fetchAllFolders();
        folderData = responseJson.data.sort((a, b) =>
            a.name.localeCompare(b.name),
        );
        showFolderList = true;
        console.log("Submitting credential:", credential);

        // Implement actual data handling here, such as an API call
    };
</script>

{#if showFolderList}
    folderData
    <ul>
        {#each folderData as folder}
            <li>
                <button>
                    <div class="p-2 mb-2 bg-white">{folder.name}</div>
                </button>
            </li>
        {/each}
    </ul>
{:else}
    <form
        on:submit|preventDefault={handleSubmit}
        class="flex flex-col p-4 max-w-sm mx-auto space-y-4"
    >
        <div>
            <label
                for="username"
                class="block text-sm font-medium text-gray-700">Username</label
            >
            <input
                id="username"
                type="text"
                bind:value={username}
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
        <div>
            <label
                for="password"
                class="block text-sm font-medium text-gray-700">Password</label
            >
            <input
                id="password"
                type="password"
                bind:value={password}
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
        <div>
            <label for="domain" class="block text-sm font-medium text-gray-700"
                >Domain</label
            >
            <input
                id="domain"
                type="text"
                bind:value={domain}
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
        <div>
            <label for="name" class="block text-sm font-medium text-gray-700"
                >Name</label
            >
            <input
                id="name"
                type="text"
                bind:value={name}
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
        <div>
            <label
                for="description"
                class="block text-sm font-medium text-gray-700"
                >Description</label
            >
            <textarea
                id="description"
                bind:value={description}
                rows="3"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
        </div>
        <button
            type="submit"
            class="px-4 py-2 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
        >
            Next
        </button>
    </form>
{/if}
