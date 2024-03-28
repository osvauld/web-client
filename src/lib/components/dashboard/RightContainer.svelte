<script lang="ts">
  import CredentialList from "./credentials/CredentialList.svelte";
  import GroupList from "./groups/GroupList.svelte";
  import { getSearchFields } from "./apis";
  import Highlight from "./components/Highlight.svelte";
  import Key from "../basic/icons/key.svelte";

  import { Profile, Lens } from "./icons";
  import {
    selectedCredential,
    selectedFolder,
    selectedPage,
    credentialStore,
    searchedCredential,
  } from "./store";

  import { fetchCredentialsByFolder } from "./apis";

  import { Folder } from "./dtos";
  import LinkIcon from "../basic/icons/linkIcon.svelte";
  let searchResults = [];
  let searchData = [];
  let showModal = false;
  const searchObjects = (query, objects) => {
    const searchResults = [];

    for (const obj of objects) {
      for (const prop in obj) {
        if (
          typeof obj[prop] === "string" &&
          obj[prop].toLowerCase().includes(query.toLowerCase())
        ) {
          searchResults.push(obj);
          break;
        }
      }
    }

    return searchResults;
  };
  const getSearchData = async () => {
    showModal = true;
    const searchFieldSResponse = await getSearchFields();
    searchData = searchFieldSResponse.data;
    if (query.length !== 0) {
      searchResults = searchObjects(query, searchData);
    } else {
      searchResults.length = 0;
    }
  };
  let query = "";
  const handleInputChange = (e) => {
    query = e.target.value;
    if (query.length !== 0) {
      searchResults = searchObjects(e.target.value, searchData);
    } else {
      searchResults.length = 0;
    }
  };
  const closeModal = () => {
    showModal = false;
    query = "";
    searchResults = [];
  };
  const selectFolder = async (folder: Folder) => {
    selectedFolder.set(folder);
    selectedCredential.set(null);
    const responseJson = await fetchCredentialsByFolder(folder.id);
    const response = await chrome.runtime.sendMessage({
      action: "decryptMeta",
      data: responseJson.data,
    });
    credentialStore.set(response.data);
  };
  const handleSearchClick = (result) => {
    searchedCredential.set(result);
    selectedPage.set("Folders");
    selectFolder({ id: result.folderId, name: result.folderName });
    closeModal();
  };

  selectedPage.subscribe(() => {
    credentialStore.set([]);
  });

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      getSearchData();
    }
  }

  function autofocus(node) {
    node.focus();
  }
</script>

<div class="flex flex-col h-auto">
  <div class="h-[7.8rem] pr-4 flex justify-between items-center">
    <div
      class="h-[2.2rem] w-2/5 px-2 mx-auto flex justify-start items-center border border-osvauld-iconblack rounded-lg cursor-pointer"
    >
      <Lens />
      <input
        type="text"
        class="h-[2rem] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
        placeholder="Search.."
        use:autofocus
        on:click={getSearchData}
        on:input={handleInputChange}
        bind:value={query}
        on:keydown={handleKeyDown}
      />
    </div>
    <div><Profile /></div>
    <!-- Content for the top part (search bar) -->
    <!-- Horizontal line -->
  </div>

  {#if showModal}
    <div
      class="fixed z-10 inset-0 overflow-y-auto backdrop-filter backdrop-blur-[2px]"
    >
      <div class="flex items-start justify-center min-h-screen mt-[3vh]">
        <button class="fixed inset-0 bg-black opacity-50" on:click={closeModal}>
        </button>
        <div
          class="bg-osvauld-frameblack border border-osvauld-iconblack rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-2xl sm:w-full !w-[40vw]"
        >
          <div
            class="h-[2.2rem] w-[90%] px-2 mx-auto mt-4 flex justify-start items-center border border-osvauld-iconblack focus-within:border-osvauld-activeBorder rounded-lg cursor-pointer"
          >
            <Lens />
            <input
              type="text"
              class="h-[2rem] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
              placeholder="Search.."
              use:autofocus
              on:click={getSearchData}
              on:input={handleInputChange}
              bind:value={query}
            />
          </div>
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
                      <Highlight text={result.name} {query} />&nbsp;
                      <span>in folder</span>&nbsp;
                      <Highlight text={result.folderName} {query} />
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
          </div>
          {#if searchResults.length === 0}
            <div
              class="bg-osvauld-frameblack w-full flex justify-center items-center px-4 mb-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse"
            >
              <p
                class="text-osvauld-placeholderblack text-base text-center w-1/2"
              >
                Try searching for keywords in credentials, folders, groups,
                descriptions and more
              </p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
  <div
    class="h-full min-h-[85vh] bg-osvauld-frameblack border border-osvauld-iconblack rounded-2xl mr-4 overflow-hidden"
  >
    <!-- Content for the bottom part (dynamic content) -->
    {#if $selectedPage === "Folders"}
      <CredentialList />
    {:else if $selectedPage === "Groups"}
      <GroupList />
    {/if}
  </div>
</div>
