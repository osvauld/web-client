<script lang="ts">
  import {
    shareFolderWithUsers,
    fetchFolderUsers,
    removeUserFromFolder,
    editFolderPermissionForUser,
  } from "../apis";
  import {
    User,
    UserWithAccessType,
    ShareFolderWithUsersPayload,
    CredentialFields,
  } from "../dtos";
  import { createEventDispatcher } from "svelte";
  import { selectedFolder, toastStore } from "../store";
  import { sendMessage, setbackground } from "../helper";
  import { Lens } from "../icons";
  import ListItem from "../components/ListItem.svelte";

  const dispatch = createEventDispatcher();
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
    const userData = await sendMessage("createShareCredPayload", {
      creds: credentialsFields,
      users: selectedUsers,
    });

    const shareFolderPayload: ShareFolderWithUsersPayload = {
      folderId: $selectedFolder.id,
      // @ts-ignore
      userData,
    };
    const shareStatus = await shareFolderWithUsers(shareFolderPayload);
    toastStore.set({
      type: "success",
      message: shareStatus.message,
      show: true,
    });
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

  function handleCancel() {
    dispatch("cancel", true);
  }
</script>

<div class="p-2 border border-osvauld-iconblack rounded-lg max-h-[65vh]">
  <div
    class="h-[1.875rem] w-full px-2 mx-auto flex justify-start items-center border border-osvauld-iconblack rounded-lg cursor-pointer"
  >
    <Lens />
    <input
      type="text"
      bind:value={searchInput}
      class="h-[1.75rem] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
      placeholder="Search for users"
    />
  </div>

  <div
    class="overflow-y-auto scrollbar-thin min-h-0 max-h-[35vh] bg-osvauld-frameblack w-full flex flex-col justify-center items-center"
  >
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
</div>

{#if selectedUsers.length !== 0}
  <div
    class="my-2 border border-osvauld-iconblack rounded-lg min-h-0 max-h-[30vh] mb-2"
  >
    <div
      class="overflow-y-auto scrollbar-thin min-h-0 max-h-[17.5vh] rounded-lg w-full px-2 mt-1"
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
        <div class="border-b border-osvauld-iconblack w-full"></div>
      {/each}
    </div>
  </div>
  <div class="p-2 w-full flex justify-end items-center box-border">
    <button
      class=" ml-auto p-2 whitespace-nowrap text-sm font-medium text-osvauld-fadedCancel"
      on:click={handleCancel}>Cancel</button
    >

    <button
      class="ml-4 px-3 py-2 whitespace-nowrap text-sm font-medium border border-osvauld-iconblack text-osvauld-textActive hover:bg-osvauld-carolinablue hover:text-osvauld-frameblack rounded-md hover:border-transparent"
      on:click={shareFolderHandler}>Save changes</button
    >
  </div>
{/if}
