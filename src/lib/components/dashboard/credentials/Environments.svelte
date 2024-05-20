<script lang="ts">
  import { scale } from "svelte/transition";
  import {
    selectedEnv,
    showAddCliDrawer,
    envStore,
    showAddEnvDrawer,
  } from "../store";
  import { sendMessage } from "../helper";
  import AddCredentialToEnv from "./AddCredentialToEnv.svelte";
  import AddCliUser from "./AddCliUser.svelte";
  import {
    Add,
    Locked,
    Eye,
    Unlocked,
    ActiveCopy,
    ClosedEye,
    CopyIcon,
    Tick,
  } from "../icons";
  import { fetchEnvFields } from "../apis";
  import EnvironmentAdd from "../../basic/icons/environmentAdd.svelte";
  import UserPlus from "../../basic/icons/userPlus.svelte";
  import AddEnvironment from "./AddEnvironment.svelte";

  let addCredentialHovered = false;
  let addcredentialToEnv = false;
  let addNewUserHovered = false;
  let addNewCliUserHovered = false;
  let visibility = false;
  let decrypted = false;
  let decryptedValue = "";
  let isFieldName = null;
  let currentMainIndex = null;
  let currentSubIndex = null;
  let hoverEffect = false;
  let credentials = [];

  const addEnv = () => {
    showAddEnvDrawer.set(true);
  };

  const addCliUser = () => {
    showAddCliDrawer.set(true);
  };

  selectedEnv.subscribe(async (value) => {
    if (value) {
      const fieldsResponse = await fetchEnvFields(value.id);
      credentials = fieldsResponse.data;
    }
  });

  const decrypt = async (fieldValue, mainIndex, subIndex) => {
    currentMainIndex = mainIndex;
    currentSubIndex = subIndex;
    const response = await sendMessage("decryptField", fieldValue);
    decryptedValue = response.data;
    decrypted = true;
  };

  const toggleVisibility = () => {
    visibility = !visibility;
    setTimeout(() => {
      visibility = false;
    }, 3000);
  };

  const lockCredential = async () => {
    decrypted = false;
    currentMainIndex = null;
    currentSubIndex = null;
  };

  const copyToClipboard = async (value, mainIndex, subIndex, iamFieldName) => {
    currentMainIndex = mainIndex;
    currentSubIndex = subIndex;
    isFieldName = iamFieldName;
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
    setTimeout(() => {
      isFieldName = null;
      currentMainIndex = null;
      currentSubIndex = null;
    }, 2000);
  };
</script>

<div class="flex justify-between items-center my-4 p-2">
  <h1
    class="text-3xl p-4 font-normal whitespace-nowrap text-osvauld-sideListTextActive"
  >
    {#if $selectedEnv}
      {$selectedEnv.name}
    {:else}
      Environments
    {/if}
  </h1>
  {#if $selectedEnv}
    <button
      class="rounded-md py-1.5 px-4 mx-2 flex justify-center items-center whitespace-nowrap text-sm border text-osvauld-textActive border-osvauld-iconblack hover:text-osvauld-frameblack hover:bg-osvauld-carolinablue"
      on:mouseenter={() => (addCredentialHovered = true)}
      on:mouseleave={() => (addCredentialHovered = false)}
      on:click={() => (addcredentialToEnv = true)}
    >
      <span class="mr-2">Add Credential to environment</span>
      <Add color={addCredentialHovered ? "#0D0E13" : "#A3A4B5"} />
    </button>
  {:else}
    <div class="flex items-center gap-4">
      <button
        class="rounded-md h-[40px] py-1.5 px-4 mx-2 flex justify-center items-center whitespace-nowrap text-sm border text-osvauld-textActive border-osvauld-iconblack hover:text-osvauld-frameblack hover:bg-osvauld-carolinablue"
        on:mouseenter={() => (addNewCliUserHovered = true)}
        on:mouseleave={() => (addNewCliUserHovered = false)}
        on:click={addCliUser}
      >
        <span class="mr-2">Add new CLI user</span>
        <UserPlus color={addNewCliUserHovered ? "#0D0E13" : "#A3A4B5"} />
      </button>

      <button
        class="rounded-md h-[40px] py-1.5 px-4 mx-2 flex justify-center items-center whitespace-nowrap text-sm border text-osvauld-textActive border-osvauld-iconblack hover:text-osvauld-frameblack hover:bg-osvauld-carolinablue"
        on:mouseenter={() => (addNewUserHovered = true)}
        on:mouseleave={() => (addNewUserHovered = false)}
        on:click={addEnv}
      >
        <span class="mr-2">Add new environment </span>
        <EnvironmentAdd color={addNewUserHovered ? "#0D0E13" : "#A3A4B5"} />
      </button>
    </div>
  {/if}
</div>

{#if $selectedEnv}
  {#each credentials as credential, mainIndex}
    <ul
      class="border border-osvauld-iconblack rounded-xl bg-osvauld-cardshade text-osvauld-fieldText mx-4 px-4 py-2 overflow-x-hidden my-6"
    >
      <div
        class="text-osvauld-fieldTextActive text-lg font-medium py-2 border-b border-osvauld-iconblack"
      >
        {credential.credentialId}
      </div>
      <div
        class="flex flex-col p-4 pl-0 pt-0 overflow-y-scroll scrollbar-thin h-[10rem] mt-2"
      >
        {#each credential.fields as field, subIndex}
          <div class="flex justify-between items-center my-1">
            <div
              class="w-[30%] bg-osvauld-fieldActive rounded-lg pl-0 pr-2 py-0.5 flex justify-between items-center"
            >
              <input
                class="py-1 px-2 inline-block w-[90%] overflow-x-hidden text-ellipsis rounded-lg items-center text-base bg-osvauld-fieldActive border-0 h-10 mx-2 focus:ring-0"
                id={`key-${subIndex}`}
                type="text"
                value={field.fieldName}
              />
              <button
                on:click|preventDefault|stopPropagation={() =>
                  copyToClipboard(field.fieldName, mainIndex, subIndex, true)}
              >
                {#if currentMainIndex === mainIndex && currentSubIndex === subIndex && isFieldName}
                  <span in:scale>
                    <Tick />
                  </span>
                {:else if hoverEffect}
                  <ActiveCopy />
                {:else}
                  <CopyIcon color={"#4D4F60"} />
                {/if}
              </button>
            </div>
            <div
              class="w-[68%] bg-osvauld-fieldActive rounded-lg pl-0 pr-2 py-0.5 flex justify-between items-center"
            >
              <input
                class="py-1 px-2 inline-block w-[90%] overflow-x-hidden text-ellipsis rounded-lg items-center text-base bg-osvauld-fieldActive border-0 h-10 mx-2 focus:ring-0"
                id={`value-${mainIndex}-${subIndex}`}
                type="text"
                autocomplete="off"
                value={decrypted &&
                currentMainIndex === mainIndex &&
                currentSubIndex === subIndex &&
                visibility
                  ? decryptedValue
                  : "*".repeat(8)}
              />
              {#if decrypted && currentMainIndex === mainIndex && currentSubIndex === subIndex}
                <div class="w-2/5 flex gap-2 items-center justify-end">
                  <button on:click|stopPropagation={lockCredential}>
                    <Unlocked />
                  </button>
                  <button on:click|stopPropagation={toggleVisibility}>
                    {#if visibility}
                      <ClosedEye />
                    {:else}
                      <Eye />
                    {/if}
                  </button>
                  <button
                    on:click|stopPropagation={() =>
                      copyToClipboard(
                        decryptedValue,
                        mainIndex,
                        subIndex,
                        false
                      )}
                  >
                    {#if currentMainIndex === mainIndex && currentSubIndex === subIndex && !isFieldName}
                      <span in:scale>
                        <Tick />
                      </span>
                    {:else if hoverEffect}
                      <ActiveCopy />
                    {:else}
                      <CopyIcon color={"#4D4F60"} />
                    {/if}
                  </button>
                </div>
              {:else}
                <button
                  on:click|stopPropagation={() =>
                    decrypt(field.fieldValue, mainIndex, subIndex)}
                >
                  <Locked color={hoverEffect ? "#89B4FA" : "#4D4F60"} />
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </ul>
  {/each}
{:else}
  <div class="w-full">
    <ul class="w-[90%] mx-auto text-osvauld-fieldText font-light">
      <div class="flex justify-between items-center p-4">
        <span class="w-[15rem] text-center">Environment Name</span><span
          class="w-[15rem] text-center">CLI user</span
        ><span class="w-[15rem] text-center pr-6">Created At</span>
      </div>
      <div class="border-b border-osvauld-iconblack my-1 w-full mt-auto"></div>
      {#each $envStore as env}
        <li
          class="my-2 py-3 px-6 bg-osvauld-cardshade rounded-lg flex justify-between items-center text-base"
        >
          <span class="w-[15rem] text-center">{env.name}</span>
          <span class="w-[15rem] text-center">{env.cliUsername}</span>
          <span class="w-[15rem] text-center"
            >{new Date(env.createdat).toLocaleString().split(",")[0]}</span
          >
        </li>
      {/each}
    </ul>
  </div>
{/if}

{#if addcredentialToEnv}
  <button
    class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
    on:click={() => !addcredentialToEnv}
  >
    <button class="p-6 rounded bg-transparent" on:click|stopPropagation>
      <AddCredentialToEnv on:close={() => (addcredentialToEnv = false)} />
    </button>
  </button>
{/if}
{#if $showAddCliDrawer}
  <button
    class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
    on:click={() => showAddCliDrawer.set(false)}
  >
    <button class="p-6 rounded bg-transparent" on:click|stopPropagation>
      <AddCliUser />
    </button>
  </button>
{/if}
{#if $showAddEnvDrawer}
  <button
    class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
    on:click={() => showAddEnvDrawer.set(false)}
  >
    <button class="p-6 rounded bg-transparent" on:click|stopPropagation>
      <AddEnvironment />
    </button>
  </button>
{/if}
