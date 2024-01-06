<script lang="ts">
  import browser from "webextension-polyfill";
  import { fly } from "svelte/transition";
  import {
    fetchEncryptedCredentialsFields,
    shareCredential,
    shareFolder,
  } from "../apis";

  import { selectedFolder, showFolderShareDrawer } from "../store";

  import { importPublicKey, encryptWithPublicKey } from "../../../utils/crypto";

  import { ShareCredentialPayload, User, UserWithAccessType } from "../dtos";

  export let users: User[];
  let selectedUsers: UserWithAccessType[] = [];

  const close = () => {
    showFolderShareDrawer.set(false);
  };

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
    console.log(selectedUsers);
  };
  const shareFolderHandler = async () => {
    // TODO: update to share credentials in the same api
    console.log("share folder button");
    if (!$selectedFolder) throw new Error("folder not selected");
    const responseJson = await fetchEncryptedCredentialsFields(
      $selectedFolder.id,
    );
    const creds = responseJson.data;
    const payload: ShareCredentialPayload[] = [];
    const shareFolderPayload: any = {
      folderId: $selectedFolder.id,
      users: [],
    };
    for (const user of selectedUsers) {
      shareFolderPayload.users.push({
        userId: user.id,
        accessType: user.accessType,
      });
    }
    await shareFolder(shareFolderPayload);
    for (const [index, cred] of creds.entries()) {
      const response = await browser.runtime.sendMessage({
        eventName: "decrypt",
        data: cred.encryptedFields,
      });
      payload[index] = { credentialId: cred.id, users: [] };
      for (const user of selectedUsers) {
        const publicKey = await importPublicKey(user.publicKey);
        const fields = [];
        for (const field of response.data) {
          const encryptedFieldValue = await encryptWithPublicKey(
            field.fieldValue,
            publicKey,
          );
          fields.push({
            fieldName: field.fieldName,
            fieldValue: encryptedFieldValue,
          });
        }
        payload[index].users.push({
          userId: user.id,
          fields: fields,
          accessType: user.accessType,
        });
      }
    }
    await shareCredential({ credentialList: payload });
    showFolderShareDrawer.set(false);
  };
</script>

<div
  class="fixed top-0 right-0 z-50 flex justify-end rounded-xl"
  in:fly
  out:fly
>
  <div class="w-128 h-full shadow-xl translate-x-0 bg-macchiato-base">
    <button class="p-2" on:click={close}>Close</button>

    <!-- Scrollable Container for Users -->
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
            <option value="folder owner">Folder Owner</option>
          </select>
        </div>
      {/each}
    </div>

    <!-- Button Always Visible at the End -->
    <div class="p-4">
      <button
        class="w-full p-4 bg-macchiato-sapphire text-macchiato-surface0 rounded-md"
        on:click={shareFolderHandler}>Share</button
      >
    </div>
  </div>
</div>
