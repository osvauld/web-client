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
  let domain: string | null = null;
  let listedCredentials: Credential[] = [];
  let domainAssociatedCredentials: Credential[] = [];
  let selectedCredentialId: string | null = null;
  let searchData = [];
  let query = "";
  let scrollPosition = 0;
  let clickedCredential: any | null = null;
  let scrollableElement;

  const openFullscreenTab = async () => {
    await sendMessage("openFullscreenTab");
  };

  const fetchCredentialsOfCurrentDomin = async () => {
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
          (field) => field.fieldName !== "Domain" && field.fieldName !== "URL",
        ),
      }));
    }
    const decyrptedResponse = await sendMessage(
      "decryptMeta",
      listedCredentials,
    );
    listedCredentials = decyrptedResponse.data;
    domainAssociatedCredentials = listedCredentials;
  };
  onMount(async () => {
    query = await localStorage.getItem("query");
    if (query.length >= 1) {
      const searchFieldSResponse = await getSearchFields();
      searchData = searchFieldSResponse.data;
      listedCredentials = searchObjects(query, searchData);
    } else {
      await fetchCredentialsOfCurrentDomin();
    }
    const user = await getUser();
    localStorage.setItem("user", JSON.stringify(user.data));
    const storedCredentialId = localStorage.getItem("selectedCredentialId");
    if (storedCredentialId != "") {
      await dropDownClicked({ detail: { credentialId: storedCredentialId } });
    }
    const storedScrollPosition = localStorage.getItem("scrollPosition");
    if (storedScrollPosition !== null) {
      scrollPosition = parseInt(storedScrollPosition);
      scrollableElement.scrollTop = scrollPosition;
    }
  });

  const handleInputChange = async (e) => {
    const query = e.target.value;
    if (query.length >= 1) {
      if (searchData.length === 0) {
        const searchFieldSResponse = await getSearchFields();
        searchData = searchFieldSResponse.data;
      }
      passwordFound = false;
      listedCredentials = searchObjects(query, searchData);
    } else {
      await fetchCredentialsOfCurrentDomin();
    }
    await localStorage.setItem("query", query);
  };

  const dropDownClicked = async (e: any) => {
    const credentialId = e.detail.credentialId;
    if (!credentialClicked) {
      const credentialResponse: any = await fetchCredsByIds([credentialId]);
      clickedCredential = credentialResponse.data[0];
      const decyrptedResponse = await sendMessage("decryptMeta", [
        clickedCredential,
      ]);
      clickedCredential = decyrptedResponse.data[0];
      const sensitiveResponse =
        await fetchSensitiveFieldsByCredentialId(credentialId);
      clickedCredential.fields = [
        ...clickedCredential.fields,
        ...sensitiveResponse.data,
      ];
      selectedCredentialId = credentialId;
      localStorage.setItem("selectedCredentialId", selectedCredentialId);
    } else {
      selectedCredentialId = null;
      localStorage.setItem("selectedCredentialId", "");
    }
    credentialClicked = !credentialClicked;
  };

  const handleScroll = async (e) => {
    scrollPosition = e.target.scrollTop;
    await localStorage.setItem("scrollPosition", scrollPosition.toString());
  };
</script>

<div class="w-full h-full">
  <div class="flex justify-between items-center mb-3 px-4 py-0">
    <h6 class="text-2xl font-medium text-osvauld-fieldText tracking-wide">
      osvauld
    </h6>
    <div>
      <button class="" on:click={openFullscreenTab}>
        <Maximize />
      </button>
    </div>
  </div>

  <div class="w-full h-[90%] p-3 overflow-hidden">
    {#if passwordFound}
      <div
        class="text-osvauld-highlightwhite mb-3 flex justify-between items-center text-sm"
      >
        <span class="text-base text-osvauld-carolinablue">
          {domain}
        </span>
        <span class="text-osvauld-sheffieldgrey">
          {domainAssociatedCredentials.length}
        </span>
      </div>
    {/if}

    <div
      class="h-9 w-full px-2 mx-auto flex justify-start items-center border border-osvauld-iconblack rounded-lg cursor-pointer mb-2"
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

    <div class="h-full p-0 scrollbar-thin">
      <div class="border-b border-osvauld-iconblack w-full mb-3"></div>
      <div
        class="h-[25rem] overflow-y-scroll scrollbar-thin"
        on:scroll={handleScroll}
        bind:this={scrollableElement}
      >
        {#each listedCredentials as credential}
          <ListedCredentials
            {credential}
            {selectedCredentialId}
            {clickedCredential}
            on:select={dropDownClicked}
          />{/each}
      </div>
    </div>
  </div>
</div>
