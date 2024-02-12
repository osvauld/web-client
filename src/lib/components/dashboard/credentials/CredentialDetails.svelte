<script lang="ts">
  import { fly } from "svelte/transition";
  import EncryptedField from "./EncryptedField.svelte";
  import PlainField from "./PlainField.svelte";
  import UserGroupToggle from "../UserGroupToggle.svelte";
  import { fetchCredentialUsers, fetchCredentialGroups } from "../apis";
  import { showCredentialDetailsDrawer } from "../store";
  import { ClosePanel } from "../icons";
  import { onMount } from "svelte";
  import ExistingListItem from "../components/ExistingListItem.svelte";
  import {
    Credential,
    Fields,
    GroupWithAccessType,
    UserWithAccessType,
  } from "../dtos";
  export let credential: Credential;
  export let sensitiveFields: Fields[];
  let selectedTab = "Groups";
  let users: UserWithAccessType[] = [];
  let groups: GroupWithAccessType[] = [];

  const toggleSelect = async (e: any) => {
    selectedTab = e.detail;
    if (selectedTab == "Users") {
      const usersResponse = await fetchCredentialUsers(credential.credentialId);
      users = usersResponse.data;
      console.log("Credential detail users is selected", users);
    } else if (selectedTab == "Groups") {
      const groupsResponse = await fetchCredentialGroups(
        credential.credentialId
      );
      groups = groupsResponse.data;
      console.log("Credential detail groups is selected", groups);
    }
  };
  onMount(async () => {
    // @ts-ignore
    const groupsResponse = await fetchCredentialGroups(credential.credentialId);
    groups = groupsResponse.data;
  });
</script>

<div
  class="fixed top-0 right-0 z-50 flex justify-end rounded-xl blur-none"
  in:fly
  out:fly
>
  <div
    class="w-[30vw] h-screen shadow-xl translate-x-0 bg-osvauld-frameblack p-6 overflow-y-auto scrollbar-thin"
  >
    <div class="flex pb-4">
      <div class="text-3xl font-semibold w-full text-left ml-2">
        {credential.name}
      </div>
      <button
        class="p-2"
        on:click={() => showCredentialDetailsDrawer.set(false)}
        ><ClosePanel /></button
      >
    </div>
    {#each credential.fields as field}
      <PlainField
        fieldName={field.fieldName}
        fieldValue={field.fieldValue}
        hoverEffect={true}
      />
    {/each}
    {#if sensitiveFields}
      {#each sensitiveFields as field}
        <EncryptedField
          fieldName={field.fieldName}
          fieldValue={field.fieldValue}
          hoverEffect={true}
        />
      {/each}
    {/if}
    <label
      class="text-osvauld-dusklabel block text-left text-sm font-normal"
      for="credential-description"
    >
      Description
    </label>
    <div
      class="mt-4 w-full h-[4rem] py-1 px-2 overflow-y-scroll bg-osvauld-bordergreen rounded-lg text-left scrollbar-thin border border-osvauld-iconblack resize-none text-basetext-osvauld-quarzowhite"
      id="credential-description"
    >
      {credential.description}
    </div>
    <UserGroupToggle on:select={toggleSelect} />
    <div class="items-left">
      {#if selectedTab == "Groups"}
        {#each groups as group}
          <ExistingListItem item={group} />
        {/each}
      {:else if selectedTab == "Users"}
        {#each users as user}
          <ExistingListItem item={user} />
        {/each}
      {/if}
    </div>
  </div>
</div>
