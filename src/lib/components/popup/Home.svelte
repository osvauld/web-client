<script lang="ts">
  import {
    fetchAllUserUrls,
    fetchCredsByIds,
    fetchSensitiveFieldsByCredentialId,
  } from "../../apis/credentials.api";
  import browser from "webextension-polyfill";
  import { onMount } from "svelte";
  import { Maximize, Lens, RightArrow, DownArrow } from "./icons";
  import PopupCard from "./components/PopupCard.svelte";
  import { Credential } from "../../dtos/credential.dto";
  import { sendMessage } from "../dashboard/helper";
  import { getUser } from "../../apis/user.api";
  import SearchModal from "../dashboard/SearchModal.svelte";
  import { searchObjects } from "../dashboard/helper";
  import { getSearchFields } from "../dashboard/apis";
  import CredentialCard from "../dashboard/credentials/CredentialCard.svelte";
  let passwordFound = false;
  let credentialClicked = false;
  let selectedCredentialIndex: number | undefined;
  let domain: string | null = null;
  let creds: Credential[] = [];
  let showCredentialCard = false;

  let searchData = [];
  let query = "";
  let searchedCredential: any | null = null;

  export const getSearchData = async () => {
    const searchFieldSResponse = await getSearchFields();
    searchData = searchFieldSResponse.data;
    searchResults = query.length !== 0 ? searchObjects(query, searchData) : [];
  };
  const handleSearchClick = async (result) => {
    // Implement the behavior specific to Home.svelte
    const credentialResponse: any = await fetchCredsByIds([result.id]);
    searchedCredential = credentialResponse.data[0];

    const decyrptedResponse = await sendMessage("decryptMeta", [
      searchedCredential,
    ]);
    searchedCredential = decyrptedResponse.data[0];
    console.log("Search result clicked:", searchedCredential);
    showCredentialCard = true;
    // For example, navigate to a different page or set a store value
    closeModal();
  };

  const closeModal = () => {
    query = "";
    searchResults = [];
  };
  const openFullscreenTab = async () => {
    await sendMessage("openFullscreenTab");
  };
  onMount(async () => {
    const responseJson = await fetchAllUserUrls();
    const urls = responseJson.data;
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const activeTab = tabs[0];
    if (activeTab && activeTab.url) domain = new URL(activeTab.url).hostname;
    const { credIds } = await sendMessage("updateAllUrls", { urls, domain });
    if (credIds.length > 0) {
      passwordFound = true;
      const responseJson = await fetchCredsByIds(credIds);
      creds = responseJson.data;
      creds = creds.map((cred) => ({
        ...cred,
        fields: cred.fields.filter(
          (field) => field.fieldName !== "Domain" && field.fieldName !== "URL"
        ),
      }));
    }
    const decyrptedResponse = await sendMessage("decryptMeta", creds);
    creds = decyrptedResponse.data;
    const user = await getUser();
    localStorage.setItem("user", JSON.stringify(user.data));
  });

  const handleInputChange = async (e) => {
    const query = e.target.value;
    if (query.length >= 1) {
      const searchFieldSResponse = await getSearchFields();
      searchData = searchFieldSResponse.data;
      creds = query.length !== 0 ? searchObjects(query, searchData) : [];
    } else {
      creds = [];
    }
  };

  const dropDownClicked = async (index: number, credential: any) => {
    console.log("credential clicked", index, credential);
    let credentialIdentification;
    if (query.length >= 1) {
      credentialIdentification = credential.id;
    } else {
      credentialIdentification = credential.credentialId;
    }
    if (!credentialClicked) {
      const credentialResponse: any = await fetchCredsByIds([
        credentialIdentification,
      ]);
      searchedCredential = credentialResponse.data[0];
      const decyrptedResponse = await sendMessage("decryptMeta", [
        searchedCredential,
      ]);
      searchedCredential = decyrptedResponse.data[0];
      console.log("searchedCredential =>", searchedCredential);
      const response = await fetchSensitiveFieldsByCredentialId(
        credentialIdentification
      );
      console.log("search resp response =>", response);
      searchedCredential.fields = [
        ...searchedCredential.fields,
        response.data[0],
      ];
      console.log("final searched credential =>", searchedCredential);
      selectedCredentialIndex = index;
    } else {
      selectedCredentialIndex = null;
    }
    credentialClicked = !credentialClicked;
  };
</script>

<div class="w-full h-full">
  <div class="flex justify-between items-center mb-3 px-4 py-0">
    <h6 class="text-2xl font-medium text-osvauld-highlightwhite tracking-wide">
      osvauld
    </h6>
    <div>
      <button class="" on:click={openFullscreenTab}>
        <Maximize />
      </button>
    </div>
  </div>

  <div
    class="rounded-lg border border-osvauld-iconblack w-full min-h-[15rem] max-h-[33rem] p-3 overflow-hidden"
  >
    {#if passwordFound}
      <div
        class="text-osvauld-highlightwhite mb-3 flex justify-between items-center text-sm"
      >
        <span class="text-base">
          {domain}
        </span>
        <span class="text-osvauld-sheffieldgrey">
          {creds.length}
        </span>
      </div>
    {/if}

    <div
      class="h-9 w-full px-2 mx-auto flex justify-start items-center border border-osvauld-iconblack rounded-lg cursor-pointer mb-4"
    >
      <Lens />
      <input
        type="text"
        class="h-7 w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-sm font-light focus:border-transparent focus:ring-0 cursor-pointer"
        placeholder="Find what you need faster.."
        on:keyup={handleInputChange}
        bind:value={query}
      />
    </div>

    <div class="h-auto p-0">
      <div
        class="border-b border-osvauld-iconblack w-[calc(100%+1.55rem)] -translate-x-[0.8rem] mb-3"
      ></div>
      <div class="h-[25rem] overflow-y-scroll scrollbar-thin">
        {#each creds as credential, index}
          <button
            class="rounded-lg border border-osvauld-iconblack px-4 py-3 font-bold text-osvauld-sheffieldgrey flex flex-col justify-center items-center w-[98%] mb-3 cursor-pointer"
            on:click={() => dropDownClicked(index, credential)}
          >
            <div
              class="w-full flex justify-between items-center {selectedCredentialIndex ===
              index
                ? 'text-osvauld-quarzowhite mb-2'
                : 'mb-0'}"
            >
              <span class="text-base font-medium tracking-wide"
                >{credential.name}</span
              >
              <button
                class="bg-osvauld-fieldActive px-4 py-1 rounded-[4px] cursor-pointer"
              >
                {#if credentialClicked && selectedCredentialIndex === index}
                  <DownArrow type={"common"} />
                {:else}
                  <RightArrow />
                {/if}
              </button>
            </div>
            {#if credentialClicked && selectedCredentialIndex === index}
              <!-- <PopupCard fields={credential.fields} /> -->
              <CredentialCard credential={searchedCredential} />
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>
