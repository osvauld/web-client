<script lang="ts">
  import ClosePanel from "../../basic/closePanel.svelte";
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";

  import { showCredentialShareDrawer } from "../store";
  import { fetchEncryptedFieldsByIds } from "../apis";

  import {
    CredentialBase,
    User,
    EncryptedCredentialFields,
    Group,
  } from "../dtos";

  import UserGroupToggle from "../UserGroupToggle.svelte";
  import ShareCredentialsWithUser from "./ShareCredentialsWithUsers.svelte";
  import ShareCredentialsWithGroups from "./ShareCredentialsWithGroups.svelte";
  import InfoIcon from '../../basic/infoIcon.svelte';
  import InfoOverlay from '../components/info.svelte';
  export let credentials: CredentialBase[];
  export let users: User[];
  export let groups: Group[];
  let encryptedCredentials: EncryptedCredentialFields[] = [];
  let infoDropdown = false;

  const credIds = credentials.map((cred) => cred.id);
  onMount(async () => {
    const responseJson = await fetchEncryptedFieldsByIds(credIds);
    encryptedCredentials = responseJson.data;
  });

  let selectedTab = "Groups";
  const toggleSelect = (e: any) => {
    selectedTab = e.detail;
  };

  /*eslint-disable*/
</script>

<div
  class="fixed top-0 right-0 z-50 flex justify-end rounded-xl blur-none"
  in:fly
  out:fly
>
  <div class="w-[30vw] h-screen shadow-xl translate-x-0 bg-osvauld-frameblack p-6">
    <div class="flex justify-between items-center p-3">
      <span class="font-sans text-white text-28 font-normal">Share Credentials</span>
      <button class="p-2" on:click={() => showCredentialShareDrawer.set(false)}
        ><ClosePanel/></button
      >
    </div>
    <div class="relative h-[30px] w-full px-4 py-2 mx-auto flex justify-between items-center border border-osvauld-bordergreen rounded-lg cursor-pointer mb-3 hover:bg-osvauld-bordergreen {infoDropdown ? "bg-osvauld-bordergreen": ""}" on:click={()=>infoDropdown = !infoDropdown}>
      <p class="whitespace-nowrap text-base text-osvauld-sheffieldgrey font-normal {infoDropdown ? "text-osvauld-highlightwhite": ""}">Select groups/users and choose access type</p>
      <span class="">
        <InfoIcon/>
      </span>
      {#if infoDropdown}
        <InfoOverlay/>
      {/if}
    </div>
   
    <UserGroupToggle on:select={toggleSelect} />
    <div class="border border-osvauld-bordergreen mb-2 w-full"></div>
    <div class="flex-grow max-h-[85vh]">
      {#if selectedTab === "Users"}
        <ShareCredentialsWithUser {users} {encryptedCredentials} />
      {:else}
        <ShareCredentialsWithGroups {groups} {encryptedCredentials} />
      {/if}
    </div>
  </div>
</div>
