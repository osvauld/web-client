<script lang="ts">
  import {
    fetchAllUserUrls,
    fetchCredsByIds,
    fetchSensitiveFieldsByCredentialId,
  } from "../../apis/credentials.api";
  import browser from "webextension-polyfill";
  import { onMount } from "svelte";
  import { Maximize, Lens, RightArrow, DownArrow, ActiveCopy } from "./icons";
  import PasswordNotFound from "./components/PasswordNotFound.svelte";
  import EncryptedField from "./components/EncryptedField.svelte";
  import { Credential } from "../../dtos/credential.dto";
  import { sendMessage } from "../dashboard/helper";
  import { getUser } from "../../apis/user.api";

  let passwordFound = false;
  let credentialClicked = false;
  let selectedCredentialIndex: number | undefined;
  let domain: string | null = null;
  let creds: Credential[] = [];
  let selectedPassword: string = "";

  const openFullscreenTab = async () => {
    await sendMessage("openFullscreenTab");
  };

  type CredMap = {
    [key: string]: {
      username: string;
      password: string;
      credentialId: string;
    };
  };
  let credMap: CredMap = {};
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
    }
    for (let cred of creds) {
      let username = "";
      let password = "";
      for (let field of cred.fields) {
        if (field.fieldName == "Username") {
          const response = await sendMessage("decryptField", field.fieldValue);
          username = response.data;
        }
      }
      // @ts-ignore
      credMap[cred.credentialId] = {
        username,
        password,
        credentialId: cred.credentialId,
      };
    }
    const user = await getUser();
    localStorage.setItem("user", JSON.stringify(user.data));
  });

  const dropDownClicked = async (index: number, credentialId: string) => {
    if (!credentialClicked) {
      const response = await fetchSensitiveFieldsByCredentialId(credentialId);
      for (let i = 0; i < response.data.length; i++) {
        if (response.data[i].fieldName === "Password") {
          selectedPassword = response.data[i].fieldValue;
        }
      }
      selectedCredentialIndex = index;
    } else {
      selectedCredentialIndex = null;
    }
    credentialClicked = !credentialClicked;
  };

  const copyToClipboard = (username: string) => {
    navigator.clipboard.writeText(username);
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
      />
    </div>

    {#if !passwordFound}
      <PasswordNotFound />
    {:else}
      <div class="h-auto p-0">
        <div
          class="border-b border-osvauld-iconblack w-[calc(100%+1.55rem)] -translate-x-[0.8rem] mb-3"
        ></div>
        <div class="h-[25rem] overflow-y-scroll scrollbar-thin">
          {#each Object.values(credMap) as credential, index}
            <button
              class="rounded-lg border border-osvauld-iconblack px-4 py-3 font-bold text-osvauld-sheffieldgrey flex flex-col justify-center items-center w-[98%] mb-3 cursor-default"
              on:click={() => dropDownClicked(index, credential.credentialId)}
            >
              <div
                class="w-full flex justify-between items-center {selectedCredentialIndex ===
                index
                  ? 'text-osvauld-quarzowhite mb-2'
                  : 'mb-0'}"
              >
                <span class="text-base font-medium tracking-wide"
                  >{credential.username}</span
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
                <div
                  class="h-[10rem] bg-osvauld-frameblack border border-osvauld-iconblack p-2 w-full rounded-lg overflow-y-scroll scrollbar-thin"
                >
                  <div class="mb-2">
                    <label
                      class="label block mb-2 text-left text-osvauld-dusklabel text-sm font-normal"
                      for={`input-`}>Username</label
                    >
                    <div
                      class="w-full rounded-lg bg-osvauld-fieldActive text-osvauld-textActive font-normal text-sm flex justify-between items-center px-2 py-1"
                    >
                      <span>{credential.username}</span>
                      <button
                        class="scale-[0.8] active:scale-75"
                        on:click|stopPropagation={() =>
                          copyToClipboard(credential.username)}
                        ><ActiveCopy />
                      </button>
                    </div>
                  </div>
                  <EncryptedField
                    fieldName={"Password"}
                    fieldValue={selectedPassword}
                  />
                </div>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
