<script lang="ts">
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import { fetchSensitiveFieldsByCredentialId } from "../apis";
  import EncryptedField from "./EncryptedField.svelte";
  import PlainField from "./PlainField.svelte";
  import { More, SensitiveEye, SensitiveEyeBlue } from "../icons";
  import { showCredentialDetailsDrawer, searchedCredential } from "../store";
  import { Credential, Fields } from "../dtos";
  import { tweened } from "svelte/motion";
  const dispatch = createEventDispatcher();
  export let credential: Credential;
  export let index: number;
  let sensitiveFields: Fields[] = [];
  let decrypted = false;
  let checked = false;
  let hoverEffect = false;
  let sensitiveCard = false;
  let hoverTimeout: any;
  let borderHighLight = tweened(0, { duration: 700 });
  $: {
    if ($searchedCredential?.id === credential.credentialId) {
      borderHighLight.set(1);
      setTimeout(() => {
        borderHighLight.set(0);
        searchedCredential.set(null);
      }, 500);
    }
  }
  function toggleCheck() {
    checked = !checked;
    dispatch("check", checked);
  }
  function handleMouseEnter() {
    hoverEffect = true;
    if (!decrypted) {
      hoverTimeout = setTimeout(async () => {
        const response = await fetchSensitiveFieldsByCredentialId(
          credential.credentialId
        );
        sensitiveFields = response.data;
        sensitiveFields.length >= 1
          ? (sensitiveCard = true)
          : (sensitiveCard = false);
      }, 300);
    }
  }
  function handleMouseLeave() {
    if (!$showCredentialDetailsDrawer) {
      sensitiveFields = [];
    }
    clearTimeout(hoverTimeout);
    decrypted = false;
    hoverEffect = false;
    sensitiveCard = false;
  }
  onMount(async () => {
    checked = false;
  });
  const handleClick = async () => {
    if (sensitiveFields.length) {
      clearTimeout(hoverTimeout);
      const response = await fetchSensitiveFieldsByCredentialId(
        credential.credentialId
      );
      sensitiveFields = response.data;
    }
    dispatch("select", sensitiveFields);
  }; /* eslint-disable */
</script>

<button
  class="mb-3 max-w-[19rem] overflow-x-hidden flex-none hover:shadow-[0_0_0_1px_#B4BEFE] rounded-xl text-osvauld-chalkwhite xl:scale-95 lg:scale-90 md:scale-90 sm:scale-75 border border-osvauld-iconblack"
  style="border: {$borderHighLight ? '1px solid #89B4FA' : ''}"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  on:click={handleClick}
>
  <button
    class="container mx-auto py-3 pl-3 pr-3 relative group bg-osvauld-cardshade rounded-xl"
  >
    <div
      class="flex justify-center items-center border-osvauld-iconblack pb-2"
      on:click|stopPropagation
    >
      <input
        type="checkbox"
        id="credentialChecker{index}"
        class="bg-osvauld-cardshade mr-2 border-osvauld-iconblack checked:bg-osvauld-lilacpink active:outline-none focus:text-primary focus:ring-offset-0 focus:ring-0 cursor-pointer"
        on:change|stopPropagation={(e) => {
          toggleCheck();
        }}
        {checked}
      />
      <label
        class="text-xl font-medium w-full text-left ml-2 cursor-pointer max-w-full text-osvauld-fieldTextActive overflow-x-hidden"
        for="credentialChecker{index}"
      >
        {credential.name}
      </label>
      <More />
    </div>
    <div
      class="border-b border-osvauld-iconblack w-[calc(100%+1.5rem)] -translate-x-3"
    ></div>
    <div
      class="w-[17rem] h-[14rem] overflow-y-scroll scrollbar-thin pr-2 {hoverEffect
        ? 'active'
        : ''} mt-2"
    >
      {#each credential.fields as field}
        <PlainField
          bgColor={null}
          fieldName={field.fieldName}
          fieldValue={field.fieldValue}
          {hoverEffect}
        />
      {/each}
      {#if sensitiveFields}
        {#each sensitiveFields as field}
          <EncryptedField
            bgColor={null}
            fieldName={field.fieldName}
            fieldValue={field.fieldValue}
            {hoverEffect}
          />
        {/each}
      {/if}
    </div>
    <label
      class="text-osvauld-dusklabel block text-left text-sm font-normal"
      for="credential-description"
    >
      Description
    </label>
    <div
      class="mt-4 w-[17rem] h-[4rem] py-1 px-2 overflow-y-scroll bg-osvauld-cardshade rounded-lg text-left scrollbar-thin border border-osvauld-iconblack resize-none text-base
      {hoverEffect ? 'text-osvauld-fieldTextActive' : 'text-osvauld-fieldText'}"
      id="credential-description"
    >
      {credential.description}
    </div>
  </button>
</button>
