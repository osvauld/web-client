<script lang="ts">
  import {
    fetchAllUserUrls,
    fetchCredsByIds,
    fetchSensitiveFieldsByCredentialId,
  } from "../../apis/credentials.api";
  import browser from "webextension-polyfill";
  import { onMount, onDestroy } from "svelte";
  import { Maximize, Lens } from "./icons";
  import { Credential } from "../../dtos/credential.dto";
  import { sendMessage } from "../dashboard/helper";
  import { getUser } from "../../apis/user.api";
  import { searchObjects } from "../dashboard/helper";
  import { getSearchFields } from "../dashboard/apis";
  import ListedCredentials from "./components/ListedCredentials.svelte";
  import PasswordNotFound from "./components/PasswordNotFound.svelte";
  import AddCredential from "./AddCredential.svelte";

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
  let port: browser.Runtime.Port;
  let addNewCredential = false;
  let newCredential: any | null = {
    username: "",
    password: "",
    domain: "",
    windowId: "",
  };
  const openFullscreenTab = async () => {
    await sendMessage("openFullscreenTab");
  };

  const readDomain = async () => {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const activeTab = tabs[0];
    if (activeTab && activeTab.url) domain = new URL(activeTab.url).hostname;
  };

  const fetchCredentialsOfCurrentDomin = async () => {
    const responseJson = await fetchAllUserUrls();
    const urls = responseJson.data;
    await readDomain();
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

      const decyrptedResponse = await sendMessage(
        "decryptMeta",
        listedCredentials,
      );
      listedCredentials = decyrptedResponse.data;
      domainAssociatedCredentials = listedCredentials;
    }
  };
  onMount(async () => {
    query = await localStorage.getItem("query");
    if (query && query.length >= 1) {
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
    port = browser.runtime.connect({ name: "popup" });
    port.onMessage.addListener(handleMessage);
  });
  const handleMessage = (msg) => {
    if (msg.username && msg.password) {
      newCredential = msg;
      addNewCredential = true;
    }
  };
  onDestroy(() => {
    port.disconnect();
    port.onMessage.removeListener(handleMessage);
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
      listedCredentials = [];
      await fetchCredentialsOfCurrentDomin();
    }
    await localStorage.setItem("query", query);
  };

  const dropDownClicked = async (e: any) => {
    const credentialId = e.detail.credentialId;
    if (!credentialClicked && credentialId) {
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

<div class="w-full h-full px-2">
  {#if !addNewCredential}
    <div class="flex justify-between items-center mb-3 py-0">
      <h6 class="text-2xl font-medium text-osvauld-fieldText tracking-wide">
        osvauld
      </h6>
      <div>
        <button class="" on:click={openFullscreenTab}>
          <Maximize />
        </button>
      </div>
    </div>
  {/if}

  <div class="w-full h-[90%] overflow-hidden">
    {#if !addNewCredential}
      <div
        class="text-osvauld-highlightwhite mb-3 flex justify-between items-center text-sm"
      >
        <span class="text-base text-osvauld-carolinablue">
          {#if domain}
            {domain}
          {/if}
        </span>
        <span
          class="text-osvauld-sheffieldgrey {passwordFound
            ? 'visible'
            : 'invisible'}"
        >
          {domainAssociatedCredentials.length}
        </span>
      </div>

      <div
        class="h-9 w-full mx-auto flex justify-start items-center border focus-within:!border-osvauld-activeBorder border-osvauld-iconblack rounded-lg cursor-pointer mb-4 pl-2"
      >
        <Lens />
        <input
          type="text"
          class="h-6 w-[70%] bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-sm font-light focus:border-transparent focus:ring-0 cursor-pointer"
          placeholder="Find what you need faster.."
          on:keyup={handleInputChange}
          bind:value={query}
          autofocus
        />
      </div>
    {/if}
    <div class="h-full p-0 scrollbar-thin">
      {#if !addNewCredential}
        <div
          class="border-b border-osvauld-darkLineSeperator mb-1 w-[calc(100%+1.5rem)] -translate-x-3"
        ></div>
      {/if}
      <div
        class="{addNewCredential
          ? 'h-[35rem] '
          : 'h-[25rem]'} overflow-y-scroll scrollbar-thin pt-3"
        on:scroll={handleScroll}
        bind:this={scrollableElement}
      >
        {#if addNewCredential}
          <AddCredential
            username={newCredential.username}
            password={newCredential.password}
            domain={newCredential.domain}
            windowId={newCredential.windowId}
          />
        {:else if listedCredentials.length !== 0}
          {#each listedCredentials as credential}
            <ListedCredentials
              {credential}
              {selectedCredentialId}
              {clickedCredential}
              on:select={dropDownClicked}
            />{/each}
        {:else}
          <PasswordNotFound />
        {/if}
      </div>
    </div>
  </div>
</div>
