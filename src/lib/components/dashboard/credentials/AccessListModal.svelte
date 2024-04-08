<script lang="ts">
  import { Lens, ClosePanel } from "../icons";
  import ExistingListParent from "../components/ExistingListParent.svelte";
  import UserGroupToggle from "../UserGroupToggle.svelte";
  import {} from "../../../store/ui.store";
  import { accessListSelected, selectedFolder, buttonRef } from "../store";
  import {
    fetchFolderUsers,
    removeUserFromFolder,
    editFolderPermissionForUser,
  } from "../apis";
  import { clickOutside } from "../helper";
  import { derived } from "svelte/store";
  import { onMount } from "svelte";
  let existingUserData = [];
  let selectedTab = "Users";
  let existingItemDropdown = false;

  export const buttonCoords = derived(buttonRef, ($buttonRef) => {
    if ($buttonRef) {
      const rect = $buttonRef.getBoundingClientRect();
      const leftVal = rect.left + window.scrollX;
      return {
        top: rect.top + window.scrollY + rect.height + 10,
        left: leftVal,
      };
    }
    return { top: 0, left: 0 };
  });

  function handleClickOutside() {
    accessListSelected.set(false);
    buttonRef.set(null);
  }

  const toggleSelect = (e: any) => {
    selectedTab = e.detail;
  };

  const existingUsers = async () => {
    if ($selectedFolder !== null) {
      const responseJson = await fetchFolderUsers($selectedFolder.id);
      existingUserData = responseJson.data;
    } else {
      existingUserData.length = 0;
    }
  };

  const removeExistingUser = async (e: any) => {
    await removeUserFromFolder($selectedFolder.id, e.detail.id);
    await existingUsers();
  };

  const handlePermissionChange = async (e: any) => {
    await editFolderPermissionForUser(
      $selectedFolder.id,
      e.detail.item.id,
      e.detail.permission
    );
    await existingUsers();
  };

  onMount(async () => {
    await existingUsers();
  });
</script>

<div
  class="absolute w-[30vw] min-h-[30rem] max-h-[40rem] p-4 z-50 bg-osvauld-frameblack border border-osvauld-iconblack rounded-2xl"
  style="top: {$buttonCoords.top}px; left: {$buttonCoords.left}px;"
  use:clickOutside
  on:clickedOutside={handleClickOutside}
>
  <div class="flex justify-between items-center p-3">
    <span class="font-sans text-osvauld-quarzowhite text-2xl font-normal"
      >AccessList of current folder</span
    >
    <button class="p-2" on:click={handleClickOutside}><ClosePanel /></button>
  </div>
  <div
    class="relative h-auto w-full px-4 py-2 mx-auto flex justify-between items-center rounded-lg cursor-pointer mb-3 bg-osvauld-fieldActive"
  >
    <p class="text-sm text-osvauld-sheffieldgrey font-normal">
      This folder contains 999 shared credentials already accessed through the
      following permission roles.
    </p>
  </div>
  <UserGroupToggle on:select={toggleSelect} />
  <div class="p-2rounded-lg max-h-[65vh]">
    <div
      class="h-[1.875rem] w-full px-2 mx-auto flex justify-start items-center border border-osvauld-iconblack rounded-lg cursor-pointer"
    >
      <Lens />
      <input
        type="text"
        class="h-[1.75rem] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
        placeholder="Search for users"
      />
    </div>

    <div
      class="overflow-y-auto scrollbar-thin min-h-0 max-h-[35vh] bg-osvauld-frameblack w-full flex flex-col justify-center items-center"
    >
      <ExistingListParent
        {existingItemDropdown}
        existingItemsData={existingUserData}
        user={true}
        on:remove={(e) => removeExistingUser(e)}
        on:permissionChange={(e) => handlePermissionChange(e)}
      />
    </div>
    <!-- {#if shareToast}
      <ShareToast
        message={"Shared Folder with user"}
        on:close={() => (shareToast = !shareToast)}
      />
    {/if} -->
  </div>
</div>
