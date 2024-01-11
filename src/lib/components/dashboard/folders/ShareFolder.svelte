<script lang="ts">
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";

  import {
    fetchEncryptedCredentialsFields,
    shareFolderWithUsers,
  } from "../apis";

  import { selectedFolder, showFolderShareDrawer } from "../store";

  import {
    User,
    UserWithAccessType,
    ShareFolderWithUsersPayload,
    EncryptedCredentialFields,
  } from "../dtos";

  import { createShareCredsPayload } from "../helper";

  export let users: User[];

  let creds: EncryptedCredentialFields[];

  let selectedUsers: UserWithAccessType[] = [];

  function handleCheck(e: any, user: User) {
    if (e.target.checked) {
      selectedUsers = [...selectedUsers, { ...user, accessType: "read" }];
    } else {
      selectedUsers = selectedUsers.filter((u) => u.id !== user.id);
    }
  }

  const handleRoleChange = (e: any, user: User) => {
    const index = selectedUsers.findIndex((u) => u.id === user.id);
    selectedUsers[index].accessType = e.target.value;
  };

  const shareFolderHandler = async () => {
    const userData = await createShareCredsPayload(creds, selectedUsers);
    const shareFolderPayload: ShareFolderWithUsersPayload = {
      folderId: $selectedFolder.id,
      userData,
    };
    console.log(shareFolderPayload);
    await shareFolderWithUsers(shareFolderPayload);
    // showFolderShareDrawer.set(false);
  };

  onMount(async () => {
    if (!$selectedFolder) throw new Error("folder not selected");
    const responseJson = await fetchEncryptedCredentialsFields(
      $selectedFolder.id,
    );
    creds = responseJson.data;
  });
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
    <div class="flex-grow overflow-y-auto max-h-[85vh] scrollbar-thin">
      {#each users as user}
        <div
          class="p-4 rounded-xl border border-transparent hover:border-macchiato-mauve flex items-center justify-between"
        >
          <div class="flex items-center space-x-4">
            <input type="checkbox" on:change={(e) => handleCheck(e, user)} />
            <p class="p-2">{user.name}</p>
          </div>
          <select
            class="bg-macchiato-overlay0 ml-auto"
            on:change={(e) => handleRoleChange(e, user)}
          >
            <option value="read">Read</option>
            <option value="write">Write</option>
            <option value="owner">Owner</option>
          </select>
        </div>
      {/each}
    </div>
    <div class="p-4">
      <button
        class="w-full p-4 bg-macchiato-sapphire text-macchiato-surface0 rounded-md"
        on:click={shareFolderHandler}>Share</button
      >
    </div>
  </div>
</div>
