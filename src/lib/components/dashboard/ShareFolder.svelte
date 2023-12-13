<script>
  import { showFolderShareDrawer } from "../../store/ui.store";
  import { fetchEncryptedCredentialsFields } from "../../apis/credentials.api";
  import { selectedFolder } from "../../store/folder.store";
  import { pvtKey } from "../../apis/temp";
  import { decryptCredentialFields } from "../../utils/crypto";
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
  const shareFolder = async () => {
    console.log("share folder button");
    const responseJson = await fetchEncryptedCredentialsFields(
      $selectedFolder.id
    );
    const creds = responseJson.data;
    const unencryptedData = [];
    for (const cred of creds) {
      const decrypted = await decryptCredentialFields(
        cred.encryptedFields,
        pvtKey
      );
      unencryptedData.push({ fields: decrypted, id: cred.id });
    }
    console.log(unencryptedData);
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
      <button class="w-full p-4 bg-blue-900" on:click={shareFolder}
        >Share</button
      >
    </div>
  </div>
</div>
