<script lang="ts">
  import { Lens } from "../icons";
  import ExistingListParent from "../components/ExistingListParent.svelte";
  import UserGroupToggle from "../UserGroupToggle.svelte";
  import { accessListSelected } from "../../../store/ui.store";
  import { selectedFolder, buttonCoords } from "../store";
  import { onMount } from "svelte";
  import {
    fetchFolderUsers,
    removeUserFromFolder,
    editFolderPermissionForUser,
  } from "../apis";
  let existingUserData = [];
  let selectedTab = "Users";
  let existingItemDropdown = false;

  function handleClickOutside() {
    console.log("Time to close this access list");
    accessListSelected.set(false);
    buttonCoords.set(null);
  }

  const toggleSelect = (e: any) => {
    selectedTab = e.detail;
  };

  const existingUsers = async (toggle = true) => {
    if (toggle) {
      existingItemDropdown = !existingItemDropdown;
    }
    if ($selectedFolder !== null) {
      const responseJson = await fetchFolderUsers($selectedFolder.id);
      existingUserData = responseJson.data;
    } else {
      existingUserData.length = 0;
    }
  };

  const removeExistingUser = async (e: any) => {
    await removeUserFromFolder($selectedFolder.id, e.detail.id);
    await existingUsers(false);
  };

  const handlePermissionChange = async (e: any) => {
    await editFolderPermissionForUser(
      $selectedFolder.id,
      e.detail.item.id,
      e.detail.permission
    );
    await existingUsers(false);
  };
</script>

<div
  class="absolute w-[30vw] z-50 bg-osvauld-frameblack border border-osvauld-iconblack rounded-2xl"
  style="top: {$buttonCoords.top}px; left: {$buttonCoords.left}px;"
  use:clickOutside
  on:clickedOutside={handleClickOutside}
>
  <UserGroupToggle on:select={toggleSelect} />
  <div class="p-2 border border-osvauld-iconblack rounded-lg max-h-[65vh]">
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
        on:click={() => existingUsers()}
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
