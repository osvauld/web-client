<script lang="ts">
  import {
    fetchAllUserUrls,
    fetchCredsByIds,
    fetchSensitiveFieldsByCredentialId,
  } from "../../apis/credentials.api";
  import browser from "webextension-polyfill";
  import { onMount } from "svelte";
  import { Maximize, Lens } from "./icons";
  import { Credential } from "../../dtos/credential.dto";
  import { sendMessage } from "../dashboard/helper";
  import { getUser } from "../../apis/user.api";
  import { searchObjects } from "../dashboard/helper";
  import { getSearchFields } from "../dashboard/apis";
  import ListedCredentials from "./components/ListedCredentials.svelte";

  let passwordFound = false;
  let credentialClicked = false;
  let selectedCredentialIndex: number | undefined;
  let domain: string | null = null;
  let listedCredentials: Credential[] = [];
  let domainAssociatedCredentials: Credential[] = [];

  let searchData = [];
  let query = "";
  let searchedCredential: any | null = null;

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
      listedCredentials = responseJson.data;
      listedCredentials = listedCredentials.map((cred) => ({
        ...cred,
        fields: cred.fields.filter(
          (field) => field.fieldName !== "Domain" && field.fieldName !== "URL"
        ),
      }));
    }
    const decyrptedResponse = await sendMessage(
      "decryptMeta",
      listedCredentials
    );
    listedCredentials = decyrptedResponse.data;
    domainAssociatedCredentials = listedCredentials;
    const user = await getUser();
    localStorage.setItem("user", JSON.stringify(user.data));
  });

  const handleInputChange = async (e) => {
    const query = e.target.value;
    if (query.length >= 1) {
      const searchFieldSResponse = await getSearchFields();
      searchData = searchFieldSResponse.data;
      listedCredentials =
        query.length !== 0 ? searchObjects(query, searchData) : [];
    } else {
      listedCredentials = [];
    }
  };

  const dropDownClicked = async (e: any) => {
    const index = e.detail.index;
    const credential = e.detail.credential;
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
      const sensitiveResponse = await fetchSensitiveFieldsByCredentialId(
        credentialIdentification
      );
      searchedCredential.fields = [
        ...searchedCredential.fields,
        ...sensitiveResponse.data,
      ];
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
        class="text-osvauld-highlightwhite mb-3 flex justify-between items-center text-sm {query.length !==
        0
          ? 'hidden'
          : ''}"
      >
        <span class="text-base">
          {domain}
        </span>
        <span class="text-osvauld-sheffieldgrey">
          {listedCredentials.length}
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
        autofocus
      />
    </div>

    <div class="h-auto p-0">
      <div
        class="border-b border-osvauld-iconblack w-[calc(100%+1.55rem)] -translate-x-[0.8rem] mb-3"
      ></div>
      <div class="h-[25rem] overflow-y-scroll scrollbar-thin">
        {#if query.length !== 0}
          {#each listedCredentials as credential, index}
            <ListedCredentials
              {credential}
              {index}
              {selectedCredentialIndex}
              {credentialClicked}
              {searchedCredential}
              on:select={dropDownClicked}
            />
          {/each}
        {:else}
          {#each domainAssociatedCredentials as credential, index}
            <ListedCredentials
              {credential}
              {index}
              {selectedCredentialIndex}
              {credentialClicked}
              {searchedCredential}
              on:select={dropDownClicked}
            />{/each}
        {/if}
      </div>
    </div>
  </div>
</div>
