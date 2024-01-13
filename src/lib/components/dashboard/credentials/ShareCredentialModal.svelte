<script lang="ts">
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

  import UserGroupToggle from "./UserGroupToggle.svelte";
  import ShareCredentialsWithUser from "./ShareCredentialsWithUsers.svelte";
  import Share from "../../basic/share.svelte";
  import ShareCredentialsWithGroups from "./ShareCredentialsWithGroups.svelte";
  export let credentials: CredentialBase[];
  export let users: User[];
  export let groups: Group[];
  let encryptedCredentials: EncryptedCredentialFields[] = [];

  const credIds = credentials.map((cred) => cred.id);
  onMount(async () => {
    console.log(users);
    const responseJson = await fetchEncryptedFieldsByIds(credIds);
    encryptedCredentials = responseJson.data;
  });

  let selectedTab = "Groups";
  const toggleSelect = (e: any) => {
    selectedTab = e.detail;
  };
</script>

<div
  class="fixed top-0 right-0 z-50 flex justify-end rounded-xl"
  in:fly
  out:fly
>
  <div class="w-128 h-full shadow-xl translate-x-0 bg-macchiato-base">
    <button class="p-2" on:click={() => showCredentialShareDrawer.set(false)}
      >Close</button
    >
    <UserGroupToggle on:select={toggleSelect} />
    <div class="flex-grow overflow-y-auto max-h-[85vh] scrollbar-thin">
      {#if selectedTab === "Users"}
        <ShareCredentialsWithUser {users} {encryptedCredentials} />
      {:else}
        <ShareCredentialsWithGroups {groups} {encryptedCredentials} />
      {/if}
    </div>
  </div>
</div>
