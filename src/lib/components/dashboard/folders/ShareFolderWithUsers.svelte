<script lang="ts">
  import {
    shareFolderWithUsers,
    fetchFolderUsers,
    removeUserFromFolder,
  } from "../apis";
  import {
    User,
    UserWithAccessType,
    ShareFolderWithUsersPayload,
    CredentialFields,
  } from "../dtos";
  import { selectedFolder, showFolderShareDrawer } from "../store";
  import { setbackground } from "../helper";
  import { Lens, DownArrow, RightArrow } from "../icons";
  import ListItem from "../components/ListItem.svelte";
  import ShareToast from "../components/ShareToast.svelte";
  import ExistingListParent from "../components/ExistingListParent.svelte";
  import browser from "webextension-polyfill";

  export let users: User[];
  export let credentialsFields: CredentialFields[];
  let selectedUsers: UserWithAccessType[] = [];
  let showOptions = false;
  let selectionIndex: number | null = null;
  let topList = false;
  let searchInput = "";
  let existingItemDropdown = false;
  let shareToast = false;
  let existingUserData: UserWithAccessType[] = [];

  $: filteredUsers = searchInput
    ? users.filter((user) =>
        user.name.toLowerCase().includes(searchInput.toLowerCase()),
      )
    : users;

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

  const shareFolderHandler = async () => {
    if ($selectedFolder === null) {
      throw new Error("Folder not selected");
    }
    const userData = await browser.runtime.sendMessage({
      action: "createShareCredPayload",
      data: {
        creds: credentialsFields,
        users: selectedUsers,
      },
    });

    const shareFolderPayload: ShareFolderWithUsersPayload = {
      folderId: $selectedFolder.id,
      // @ts-ignore
      userData,
    };
    const shareStatus = await shareFolderWithUsers(shareFolderPayload);
    shareToast = shareStatus.success === true;
  };

  function handleClick(index: number, isSelectedList: boolean) {
    showOptions = !showOptions;
    selectionIndex = index;
    topList = isSelectedList;
  }

  function handleItemRemove(index: number) {
    const removedUser = selectedUsers.splice(index, 1);
    selectedUsers = [...selectedUsers];
    const [{ accessType, ...userWithoutAccessType }] = removedUser;
    users = [...users, { ...userWithoutAccessType }];
  }

  function handleRoleChange(e: any, index: number, type: string) {
    const user = e.detail.item;
    const option = e.detail.permission;
    showOptions = !showOptions;
    selectionIndex = null;
    if (type === "selectedUsers") {
      selectedUsers.splice(index, 1);
      selectedUsers = [...selectedUsers, { ...user, accessType: option }];
    } else {
      selectedUsers = [...selectedUsers, { ...user, accessType: option }];
      users = users.filter((u) => u.id !== user.id);
    }
  }

  const removeExistingUser = async (e: any) => {
    console.log("removing user...");
    await removeUserFromFolder($selectedFolder.id, e.detail.id);
    await existingUsers(false);
  };
</script>

<div class="p-2 border border-osvauld-bordergreen rounded-lg h-[50vh]">
  <div
    class="h-[1.875rem] w-full px-2 mx-auto flex justify-start items-center border border-osvauld-bordergreen rounded-lg cursor-pointer mb-2"
  >
    <Lens />
    <input
      type="text"
      bind:value={searchInput}
      class="h-[1.75rem] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
      placeholder="Search for users"
    />
  </div>

  <div class="border border-osvauld-bordergreen my-1 w-full mb-1"></div>

  <div
    class="overflow-y-auto scrollbar-thin h-[35vh] bg-osvauld-frameblack w-full"
  >
    {#each selectedUsers as user, index}
      <ListItem
        item={user}
        isSelected={index === selectionIndex && topList}
        isTopList={true}
        on:click={() => handleClick(index, true)}
        on:remove={() => handleItemRemove(index)}
        {setbackground}
        {showOptions}
        on:select={(e) => handleRoleChange(e, index, "selectedUsers")}
      />
    {/each}
    {#each filteredUsers as user, index}
      <ListItem
        item={user}
        isSelected={index === selectionIndex && !topList}
        isTopList={false}
        on:click={() => handleClick(index, false)}
        {setbackground}
        {showOptions}
        on:select={(e) => handleRoleChange(e, index, "users")}
      />
    {/each}
  </div>

  <div class="p-2 flex justify-between items-center box-border">
    <button
      class="w-[45%] px-4 py-2 bg-osvauld-iconblack border border-osvauld-placeholderblack rounded-md text-osvauld-sheffieldgrey"
      >Cancel</button
    >

    <button
      class="w-[45%] px-4 py-2 bg-osvauld-carolinablue text-macchiato-surface0 rounded-md"
      on:click={shareFolderHandler}>Share</button
    >
  </div>
  {#if shareToast}
    <ShareToast on:close={() => (shareToast = !shareToast)} />
  {/if}
</div>

<ExistingListParent
  {existingItemDropdown}
  existingItemsData={existingUserData}
  user={true}
  on:click={() => existingUsers()}
  on:remove={(e) => removeExistingUser(e)}
/>
