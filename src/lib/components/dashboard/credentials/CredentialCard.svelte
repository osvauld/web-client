<script lang="ts">
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import { fetchSensitiveFieldsByCredentialId } from "../apis";
  import EncryptedField from "./EncryptedField.svelte";
  import PlainField from "./PlainField.svelte";
  import { More, SensitiveEye, SensitiveEyeBlue } from "../icons";
  import { showCredentialDetailsDrawer } from "../store";

  const dispatch = createEventDispatcher();

  export let credential;
  export let index;

  let sensitiveFields = [];
  let decrypted = false;
  let checked = false;
  let hoverEffect = false;
  let sensitiveCard = false;
  let hoverTimeout;

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
  };

  /* eslint-disable */
</script>

<button
  class="mb-3 flex-none hover:border hover:border-osvauld-activelavender rounded-xl text-osvauld-chalkwhite xl:scale-95 lg:scale-90 md:scale-90 sm:scale-75"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  on:click={handleClick}
>
  <button
    class="container mx-auto py-3 pl-3 pr-3 relative group bg-osvauld-bordergreen rounded-xl"
  >
    <div
      class="flex justify-center items-center border-osvauld-iconblack pb-2"
      on:click|stopPropagation
    >
      <input
        type="checkbox"
        id="credentialChecker{index}"
        class="bg-osvauld-bordergreen mr-2 border-osvauld-iconblack checked:bg-osvauld-lilacpink active:outline-none focus:text-primary focus:ring-offset-0 focus:ring-0 cursor-pointer"
        on:change|stopPropagation={(e) => {
          toggleCheck();
        }}
        {checked}
      />
      <label
        class="text-xl font-medium w-full text-left ml-2 cursor-pointer"
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
      class="w-[17rem] h-[16rem] overflow-y-scroll scrollbar-thin {hoverEffect
        ? 'active'
        : ''} mt-2"
    >
      {#each credential.fields as field, index}
        <PlainField
          fieldName={field.fieldName}
          fieldValue={field.fieldValue}
          {hoverEffect}
        />
      {/each}
      {#if sensitiveFields}
        {#each sensitiveFields as field}
          <EncryptedField
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
      class="mt-4 w-[17rem] h-[4rem] py-1 px-2 overflow-y-scroll bg-osvauld-bordergreen rounded-lg text-left scrollbar-thin border border-osvauld-iconblack resize-none text-base
            {hoverEffect
        ? 'text-osvauld-quarzowhite'
        : 'text-osvauld-sheffieldgrey'}"
      id="credential-description"
    >
      {credential.description}
    </div>

    <div
      class="border-t border-osvauld-iconblack w-[calc(100%+1.5rem)] -translate-x-3 my-2"
    ></div>
    <div class="flex justify-start">
      <span
        class="{hoverEffect && sensitiveCard
          ? 'bg-osvauld-sensitivebgblue text-osvauld-carolinablue'
          : 'bg-osvauld-sensitivebgblack text-osvauld-chalkwhite'} py-0 px-3 text-sm border border-osvauld-bordergreen rounded-[4px] flex justify-center items-center"
      >
        {#if hoverEffect && sensitiveCard}
          <SensitiveEyeBlue />
        {:else}
          <SensitiveEye />
        {/if}
        <span
          class="ml-2 {hoverEffect && sensitiveCard
            ? 'text-osvauld-carolinablue'
            : 'text-osvauld-placeholderblack'}">Sensitive Fields</span
        >
      </span>
    </div>
  </button>
</button>
