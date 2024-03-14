<script lang="ts">
  import CredentialList from "./credentials/CredentialList.svelte";
  import GroupList from "./groups/GroupList.svelte";
  import { getSearchFields } from "./apis";
  import Highlight from "./components/Highlight.svelte";
  import ClosePanel from "../basic/icons/closePanel.svelte";
  import Key from "../basic/icons/key.svelte";

  import { Profile, Lens } from "./icons";
  import {
    selectedCredential,
    selectedFolder,
    selectedPage,
    credentialStore,
  } from "./store";

  import browser from "webextension-polyfill";
  import { fetchCredentialsByFolder } from "./apis";

  import { Folder } from "./dtos";
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
    const searchFieldSResponse = await getSearchFields();
    console.log(searchFieldSResponse.data);
    searchData = searchFieldSResponse.data;
    showModal = true;
  };
  let query = "";
  const handleInputChange = (e) => {
    query = e.target.value;
    searchResults = searchObjects(e.target.value, searchData);
    console.log(searchResults);
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

    const response = await browser.runtime.sendMessage({
      action: "decryptMeta",
      data: responseJson.data,
    });
    credentialStore.set(response.data);
  };
  const handleSearchClick = (result) => {
    console.log(result);
    selectedPage.set("Credentials");
    selectFolder({ id: result.folderId, name: result.folderName });
    closeModal();
  };
</script>

<div class="flex flex-col h-auto">
  <div class="h-[7.8rem] pr-4 flex justify-between items-center">
    {#if !showModal}
      <div
        class="h-[1.9rem] w-2/5 px-2 mx-auto flex justify-start items-center border border-osvauld-iconblack rounded-lg cursor-pointer"
      >
        <Lens />
        <input
          type="text"
          class="h-[1.75rem] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
          placeholder="Search"
          on:click={getSearchData}
          on:input={handleInputChange}
          bind:value={query}
        />
      </div>
    {/if}
    <div><Profile /></div>
    <!-- Content for the top part (search bar) -->
    <!-- Horizontal line -->
  </div>

  {#if showModal}
    <div class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen">
        <button class="fixed inset-0 bg-black opacity-50" on:click={closeModal}>
        </button>
        <div
          class="bg-osvauld-frameblack border border-osvauld-iconblack rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full"
        >
          <div
            class="h-[3rem] w-[90%] px-2 mx-auto mt-4 flex justify-start items-center border-2 border-osvauld-carolinablue rounded-lg cursor-pointer"
          >
            <Lens />
            <input
              type="text"
              class="h-[1.75rem] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
              placeholder="Search"
              autofocus
              on:click={getSearchData}
              on:input={handleInputChange}
              bind:value={query}
            />
          </div>
          <div class="p-4 bg-osvauld-frameblack">
            <div
              class="max-h-64 min-h-32 overflow-y-auto flex justify-start items-center flex-col"
            >
              {#each searchResults as result}
                <button
                  on:click={() => handleSearchClick(result)}
                  class="p-3 border border-osvauld-iconblack hover:bg-osvauld-iconblack w-full border-b-0 flex justify-start items-center"
                >
                  <div
                    class="h-full flex justify-center items-center scale-150 px-2"
                  >
                    <Key />
                  </div>
                  <div>
                    <div
                      class="ml-4 flex justify-start items-center text-base font-semibold"
                    >
                      <Highlight text={result.folderName} {query} />
                    </div>
                    <div
                      class="ml-4 flex justify-start items-center text-sm font-light"
                    >
                      <Highlight text={result.name} {query} />
                      <Highlight text={result.description} {query} />
                      {#if result.domain}
                        <Highlight text={result.domain} {query} />
                      {/if}
                    </div>
                  </div>
                </button>
              {/each}
            </div>
          </div>
          <div
            class="bg-osvauld-frameblack px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse"
          >
            <button
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-osvauld-carolinablue text-base font-medium text-osvauld-frameblack focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
              on:click={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
  <div
    class="h-auto min-h-[85vh] bg-osvauld-frameblack border-2 border-osvauld-iconblack rounded-2xl mr-4"
  >
    <!-- Content for the bottom part (dynamic content) -->
    {#if $selectedPage === "Credentials"}
      <CredentialList />
    {:else if $selectedPage === "Groups"}
      <GroupList />
    {/if}
  </div>
</div>
