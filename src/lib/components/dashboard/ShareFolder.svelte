<script>
  import { showFolderShareDrawer } from "../../store/ui.store";
  import {
    fetchEncryptedCredentialsFields,
    shareCredential,
  } from "../../apis/credentials.api";
  import { shareFolder } from "../../apis/folder.api";
  import { selectedFolder } from "../../store/folder.store";
  import { importPublicKey, encryptWithPublicKey } from "../../utils/crypto";
  const close = () => {
    console.log("close");
    showFolderShareDrawer.set(false);
  };

  export let users;
  let selectedUsers = [];
  function handleCheck(e, user) {
    if (e.target.checked) {
      selectedUsers = [...selectedUsers, user];
    } else {
      selectedUsers = selectedUsers.filter((u) => u.id !== user.id);
    }
  }
  const shareFolderHandler = async () => {
    // TODO: update to share credentials in the same api
    console.log("share folder button");
    const responseJson = await fetchEncryptedCredentialsFields(
      $selectedFolder.id
    );
    const creds = responseJson.data;
    const unencryptedData = [];
    const payload = [];
    const shareFolderPayload = {
      folderId: $selectedFolder.id,
      users: [],
    };
    for (const user of selectedUsers) {
      shareFolderPayload.users.push({ userId: user.id, accessType: "read" });
    }
    await shareFolder(shareFolderPayload);
    for (const [index, cred] of creds.entries()) {
      const response = await browser.runtime.sendMessage({
        eventName: "decrypt",
        data: cred.encryptedFields,
      });
      payload[index] = { credentialId: cred.id, users: [] };
      unencryptedData.push({ fields: response.data, id: cred.id });
      for (const user of selectedUsers) {
        const publicKey = await importPublicKey(user.publicKey);
        const fields = [];
        for (const field of response.data) {
          const encryptedFieldValue = await encryptWithPublicKey(
            field.fieldValue,
            publicKey
          );
          fields.push({
            fieldName: field.fieldName,
            fieldValue: encryptedFieldValue,
          });
        }
        payload[index].users.push({ userId: user.id, fields: fields });
      }
    }
    await shareCredential({ credentialList: payload });
  };
</script>

<div class="fixed bg-gray-600 top-0 right-0 z-50 flex justify-end rounded-xl">
  <div class="flex flex-col w-72 h-screen">
    <button class="p-2" on:click={close}>Close</button>

    <!-- Scrollable Container for Users -->
    <div class="flex-grow overflow-y-auto max-h-[85vh] bg-[#2E3654]">
      {#each users as user}
        <div class="p-4 rounded-xl border hover:border-[#4C598B]">
          <input type="checkbox" on:change={(e) => handleCheck(e, user)} />
          {user.name}
        </div>
      {/each}
    </div>

    <!-- Button Always Visible at the End -->
    <div class="p-4">
      <button class="w-full p-4 bg-[#4E46DC]" on:click={shareFolderHandler}
        >Share</button
      >
    </div>
  </div>
</div>
