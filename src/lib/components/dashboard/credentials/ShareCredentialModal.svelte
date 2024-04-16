<script lang="ts">
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";

  import { showCredentialShareDrawer } from "../store";
  import { fetchCredentialsFieldsByIds } from "../apis";

  import { User, Group, Credential, CredentialFields } from "../dtos";

  import UserGroupToggle from "../UserGroupToggle.svelte";
  import ShareCredentialsWithUser from "./ShareCredentialsWithUsers.svelte";
  import ShareCredentialsWithGroups from "./ShareCredentialsWithGroups.svelte";
  import InfoIcon from "../../basic/icons/infoIcon.svelte";
  import InfoOverlay from "../components/Info.svelte";
  import ClosePanel from "../../basic/icons/closePanel.svelte";
  export let credentials: Credential[];
  export let users: User[];
  export let groups: Group[];
  let credentialsFields: CredentialFields[] = [];
  let infoDropdown = false;
  let showInfoTab = false;
  let infoOnHover = false;

  const credIds = credentials.map((cred) => cred.credentialId);
  onMount(async () => {
    const responseJson = await fetchCredentialsFieldsByIds(credIds);
    credentialsFields = responseJson.data;
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
  <div
    class="w-[30vw] h-screen shadow-xl translate-x-0 bg-osvauld-frameblack p-6"
  >
    <div class="flex justify-between items-center p-3">
      <span
        class="font-sans text-white text-28 font-normal flex justify-between items-center"
      >
        <span>Share Credentials</span>
        <button
          class="ml-2"
          on:mouseenter={() => (infoOnHover = true)}
          on:mouseleave={() => (infoOnHover = false)}
          on:click={() => (showInfoTab = !showInfoTab)}
          ><InfoIcon color={infoOnHover ? "#BFC0CC" : "#4D4F60"} /></button
        ></span
      >
      <button class="p-2" on:click={() => showCredentialShareDrawer.set(false)}
        ><ClosePanel /></button
      >
    </div>

    {#if showInfoTab}
      <div
        class="relative h-[1.875rem] w-full px-4 py-2 mx-auto flex justify-between items-center border border-osvauld-bordergreen rounded-lg cursor-pointer mb-3 hover:bg-osvauld-bordergreen {infoDropdown
          ? 'bg-osvauld-bordergreen'
          : ''}"
        on:click={() => (infoDropdown = !infoDropdown)}
      >
        <span class="">
          <InfoIcon />
        </span>
        <p
          class="whitespace-nowrap text-base text-osvauld-sheffieldgrey font-normal {infoDropdown
            ? 'text-osvauld-highlightwhite'
            : ''}"
        >
          Select groups/users and choose access type
        </p>

        {#if infoDropdown}
          <InfoOverlay />
        {/if}
      </div>
    {/if}

    <div class="flex-grow max-h-[85vh]">
      <UserGroupToggle on:select={toggleSelect} />
      {#if selectedTab === "Users"}
        <ShareCredentialsWithUser
          {users}
          {credentialsFields}
          on:cancel={() => showCredentialShareDrawer.set(false)}
        />
      {:else}
        <ShareCredentialsWithGroups
          {groups}
          {credentialsFields}
          on:cancel={() => showCredentialShareDrawer.set(false)}
        />
      {/if}
    </div>
  </div>
</div>
