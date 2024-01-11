<script lang="ts">
  import { fly } from "svelte/transition";

  import { showCredentialShareDrawer } from "../store";
  import {
    shareCredentialsWithUsers,
    fetchEncryptedFieldsByIds,
  } from "../apis";

  import {
    CredentialBase,
    ShareCredentialsWithUsersPayload,
    UserWithAccessType,
    User,
    EncryptedCredentialFields,
  } from "../dtos";

  import { createShareCredsPayload } from "../helper";
  export let creds: CredentialBase[];
  export let users: User[];
  let selectedUsers: UserWithAccessType[] = [];

  const credIds = creds.map((cred) => cred.id);

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

  const shareCredentialHandler = async () => {
    // TODO: update to share credentials in the same api
    const responseJson = await fetchEncryptedFieldsByIds(credIds);
    const creds: EncryptedCredentialFields[] = responseJson.data;
    const userData = await createShareCredsPayload(creds, selectedUsers);
    const payload: ShareCredentialsWithUsersPayload = { userData };
    await shareCredentialsWithUsers(payload);
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
        on:click={shareCredentialHandler}>Share</button
      >
    </div>
  </div>
</div>
