<script>
  import { showCredentialShareDrawer } from "../../store/ui.store";
  import {
    shareCredential,
    fetchEncryptedFieldsByIds,
  } from "../../apis/credentials.api";
  import browser from "webextension-polyfill";
  import { importPublicKey, encryptWithPublicKey } from "../../utils/crypto";
  const close = () => {
    console.log("close");
    showCredentialShareDrawer.set(false);
  };

  export let creds;
  export let users;
  const credIds = creds.map((cred) => cred.id);
  let selectedUsers = [];
  function handleCheck(e, user) {
    if (e.target.checked) {
      selectedUsers = [...selectedUsers, user];
    } else {
      selectedUsers = selectedUsers.filter((u) => u.id !== user.id);
    }
  }
  const shareCredentialHandler = async () => {
    // TODO: update to share credentials in the same api
    console.log("share folder button");
    const responseJson = await fetchEncryptedFieldsByIds(credIds);
    const creds = responseJson.data;
    const unencryptedData = [];
    const payload = [];

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
        for (const field of decrypted) {
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
      <button class="w-full p-4 bg-blue-900" on:click={shareCredentialHandler}
        >Share</button
      >
    </div>
  </div>
</div>
