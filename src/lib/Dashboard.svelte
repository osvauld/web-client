<script lang="ts">
  import { onMount } from "svelte";
  import LeftContainer from "./components/dashboard/LeftContainer.svelte";
  import RightContainer from "./components/dashboard/RightContainer.svelte";
  import { fetchAllFolders } from "./apis/folder.api";
  import { folderStore } from "./store/folder.store";
  import MoreActions from "./components/dashboard/components/MoreActions.svelte";
  import CredentialDeleteModal from "./components/dashboard/credentials/CredentialDeleteModal.svelte";
  import FolderDeleteModal from "./components/dashboard/folders/FolderDeleteModal.svelte";
  import {
    showMoreOptions,
    DeleteConfirmationModal,
    modalManager,
    accessListSelected,
    showMoreGroupOptions,
  } from "./store/ui.store";
  import { sendMessage } from "./components/dashboard/helper";
  import Welcome from "./components/popup/Welcome.svelte";
  import Signup from "./components/popup/Signup.svelte";
  import { getUser } from "./apis/user.api";
  import AccessListModal from "./components/dashboard/credentials/AccessListModal.svelte";
  import MoreActionsGroup from "./components/dashboard/components/MoreActionsGroup.svelte";
  import GroupDeleteModal from "./components/dashboard/groups/GroupDeleteModal.svelte";
  let showWelcome = false;
  let signedUp = true;
  onMount(async () => {
    const response = await sendMessage("isSignedUp");
    const checkPvtLoad = await sendMessage("checkPvtLoaded");
    signedUp = response.isSignedUp;
    if (checkPvtLoad === false) {
      showWelcome = true;
    } else {
      const responseJson = await fetchAllFolders();
      folderStore.set(responseJson.data);
    }
  });

  const handleSignedUp = () => {
    signedUp = true;
  };
  const handleAuthenticated = async () => {
    const user = await getUser();
    localStorage.setItem("user", JSON.stringify(user.data));
    const responseJson = await fetchAllFolders();
    folderStore.set(responseJson.data);
    showWelcome = false;
  };
</script>

<main
  class="
    bg-osvauld-frameblack
   w-screen h-screen text-macchiato-text text-lg !font-sans"
>
  {#if !signedUp}
    <Signup on:signedUp={handleSignedUp} />
  {:else if showWelcome}
    <Welcome on:authenticated={handleAuthenticated} />
  {:else}
    <div class="flex h-full">
      <div
        class="w-1/5 h-full overflow-y-scroll overflow-x-hidden scrollbar-thin relative z-10"
      >
        <LeftContainer />
      </div>
      <!-- Right container -->
      <div
        class="w-4/5 h-full overflow-hidden border-l border-osvauld-iconblack"
      >
        <RightContainer />
      </div>
    </div>

    {#if $showMoreOptions}
      <MoreActions />
    {/if}
    {#if $DeleteConfirmationModal && $modalManager.type === "Credential"}
      <CredentialDeleteModal />
    {:else if $DeleteConfirmationModal && $modalManager.type === "Folder"}
      <FolderDeleteModal />
    {:else if $DeleteConfirmationModal && $modalManager.type === "Group"}
      <GroupDeleteModal />
    {/if}
    {#if $accessListSelected}
      <AccessListModal />
    {/if}
    {#if $showMoreGroupOptions}
      <MoreActionsGroup />
    {/if}
  {/if}
</main>
