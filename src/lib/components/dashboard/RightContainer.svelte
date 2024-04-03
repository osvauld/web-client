<script lang="ts">
  import CredentialList from "./credentials/CredentialList.svelte";
  import GroupList from "./groups/GroupList.svelte";
  import SearchModal from "./SearchModal.svelte";
  import { searchObjects } from "./helper";
  import { getSearchFields } from "./apis";
  import { Profile, Lens } from "./icons";
  import {
    selectedFolder,
    selectedPage,
    credentialStore,
    searchedCredential,
  } from "./store";

  import { Folder } from "./dtos";
  let searchResults = [];
  let searchData = [];
  let showModal = false;
  let query = "";

  const getSearchData = async () => {
    showModal = true;
    const searchFieldSResponse = await getSearchFields();
    searchData = searchFieldSResponse.data;
    searchResults = query.length !== 0 ? searchObjects(query, searchData) : [];
  };

  const handleInputChange = (e: any) => {
    const query = e.type === "input" ? e.target.value : e.detail;
    searchResults = query.length >= 1 ? searchObjects(query, searchData) : [];
  };

  const closeModal = () => {
    showModal = false;
    query = "";
    searchResults = [];
  };
  const selectFolder = async (folder: Folder) => {
    selectedFolder.set(folder);
  };

  const handleSearchClick = (e: any) => {
    searchedCredential.set(e.detail);
    selectedPage.set("Folders");
    selectFolder({ id: e.detail.folderId, name: e.detail.folderName });
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
  <div class="h-[6rem] pr-4 flex justify-between items-center">
    <div
      class="h-[2.2rem] w-[31.25rem] px-2 mx-auto flex justify-start items-center border border-osvauld-iconblack rounded-lg cursor-pointer"
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
        on:keyup={handleKeyDown}
      />
    </div>
    <div><Profile /></div>
  </div>

  {#if showModal}
    <SearchModal
      {searchResults}
      {query}
      on:close={closeModal}
      on:select={handleSearchClick}
      on:change={handleInputChange}
      on:search={getSearchData}
      on:enter={handleKeyDown}
    />
  {/if}
  <div
    class="h-[90vh] bg-osvauld-frameblack border border-osvauld-iconblack rounded-2xl mr-4 overflow-hidden"
  >
    <!-- Content for the bottom part (dynamic content) -->
    {#if $selectedPage === "Folders"}
      <CredentialList />
    {:else if $selectedPage === "Groups"}
      <GroupList />
    {/if}
  </div>
</div>
