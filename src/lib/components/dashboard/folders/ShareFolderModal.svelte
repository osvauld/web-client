<script lang="ts">
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";

  import { fetchEncryptedCredentialsFields } from "../apis";
  import ShareFolderWithGroups from "./ShareFolderWithGroups.svelte";
  import UserGroupToggle from "../UserGroupToggle.svelte";
  import ShareFolderWithUsers from "./ShareFolderWithUsers.svelte";
  import { selectedFolder, showFolderShareDrawer } from "../store";

  import { User, EncryptedCredentialFields } from "../dtos";

  export let users: User[];

  let creds: EncryptedCredentialFields[];

  onMount(async () => {
    if (!$selectedFolder) throw new Error("folder not selected");
    const responseJson = await fetchEncryptedCredentialsFields(
      $selectedFolder.id,
    );
    creds = responseJson.data;
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
    <button class="p-2" on:click={() => showFolderShareDrawer.set(false)}
      >Close</button
    >
    <UserGroupToggle on:select={toggleSelect} />
    {#if selectedTab === "Users"}
      <ShareFolderWithUsers {users} {creds} />
    {:else if selectedTab === "Groups"}
      <ShareFolderWithGroups encryptedCredentials={creds} />
    {/if}
  </div>
</div>
