<script lang="ts">
  import { Lens, ClosePanel, EditIcon, InfoIcon } from "../icons";
  import ExistingListParent from "../components/ExistingListParent.svelte";
  import UserGroupToggle from "../UserGroupToggle.svelte";
  import { accessListSelected, selectedFolder, buttonRef } from "../store";
  import {
    fetchFolderUsers,
    removeUserFromFolder,
    editFolderPermissionForUser,
    fetchFolderGroups,
    removeGroupFromFolder,
    editFolderPermissionForGroup,
  } from "../apis";
  import { clickOutside } from "../helper";
  import { derived } from "svelte/store";
  import { onMount } from "svelte";
  import { blur, fly } from "svelte/transition";
  import { spawn } from "child_process";
  let existingUserData = [];
  let existingGroupsData = [];
  let selectedTab = "Groups";
  let existingItemDropdown = false;
  let editPermissionTrigger = false;

  export const buttonCoords = derived(buttonRef, ($buttonRef) => {
    if ($buttonRef) {
      const rect = $buttonRef.getBoundingClientRect();
      const rightVal = rect.right + window.scrollX;
      return {
        top: rect.top + window.scrollY + rect.height + 10,
        right: rightVal,
      };
    }
    return { top: 0, left: 0 };
  });

  function handleClickOutside() {
    accessListSelected.set(false);
    buttonRef.set(null);
  }

  const toggleSelect = async (e: any) => {
    selectedTab = e.detail;
    await existingItems();
  };

  const existingItems = async () => {
    if ($selectedFolder !== null && selectedTab === "Users") {
      const responseJson = await fetchFolderUsers($selectedFolder.id);
      existingUserData = responseJson.data;
    } else {
      existingUserData.length = 0;
    }
    if ($selectedFolder !== null && selectedTab === "Groups") {
      const reponseJson = await fetchFolderGroups($selectedFolder.id);
      existingGroupsData = reponseJson.data;
    } else {
      existingGroupsData.length = 0;
    }
  };

  const removeExistingUser = async (e: any) => {
    await removeUserFromFolder($selectedFolder.id, e.detail.id);
    await existingItems();
  };

  const removeExistingGroup = async (e: any) => {
    await removeGroupFromFolder($selectedFolder.id, e.detail.groupId);
    await existingItems();
  };

  const handlePermissionChange = async (e: any) => {
    if (selectedTab === "Users") {
      await editFolderPermissionForUser(
        $selectedFolder.id,
        e.detail.item.id,
        e.detail.permission
      );
    } else {
      await editFolderPermissionForGroup(
        $selectedFolder.id,
        e.detail.item.groupId,
        e.detail.permission
      );
    }
    await existingItems();
  };

  onMount(async () => {
    await existingItems();
  });
</script>

<div
  class="absolute w-[29rem] min-h-[30rem] max-h-[40rem] p-4 z-50 bg-osvauld-frameblack border border-osvauld-iconblack rounded-2xl"
  style="top: {$buttonCoords.top}px; right: {window.innerWidth -
    $buttonCoords.right}px;"
  use:clickOutside
  on:clickedOutside={handleClickOutside}
  in:fly
>
  <div class="flex justify-between items-center p-3">
    <span class="font-sans text-osvauld-quarzowhite text-2xl font-normal"
      >Access List</span
    >
    <button class="p-2" on:click={handleClickOutside}><ClosePanel /></button>
  </div>
  <div
    class="relative h-auto w-full px-4 py-2 mx-auto flex justify-between items-center rounded-lg cursor-pointer mb-3 bg-osvauld-fieldActive"
  >
    <span class="w-[12%]"> <InfoIcon /> </span>
    <p class="text-sm text-osvauld-sheffieldgrey font-normal">
      This folder contains credentials you already have access through the
      following permission roles.
    </p>
  </div>
  <div class="flex justify-around items-center">
    <UserGroupToggle on:select={toggleSelect} />
    <div class="flex justify-end items-center w-full">
      <button
        class="p-2 rounded-lg {editPermissionTrigger
          ? 'bg-osvauld-cardshade'
          : ''}"
        on:click={() => {
          editPermissionTrigger = !editPermissionTrigger;
        }}
      >
        <EditIcon color={editPermissionTrigger ? "#89B4FA" : "#6E7681"} />
      </button>
    </div>
  </div>
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
      {#if selectedTab === "Users"}
        <ExistingListParent
          isUser={true}
          {editPermissionTrigger}
          existingItemsData={existingUserData}
          on:remove={(e) => removeExistingUser(e)}
          on:permissionChange={(e) => handlePermissionChange(e)}
        />
      {:else}
        <ExistingListParent
          {editPermissionTrigger}
          isUser={false}
          existingItemsData={existingGroupsData}
          on:remove={(e) => removeExistingGroup(e)}
          on:permissionChange={(e) => handlePermissionChange(e)}
        />
      {/if}
    </div>
  </div>
</div>
