<script lang="ts">
  import {
    User,
    UserWithAccessType,
    CredentialFields,
    ShareCredentialsWithUsersPayload,
  } from "../dtos";
  import { createEventDispatcher } from "svelte";
  import { shareCredentialsWithUsers } from "../apis";
  import { setbackground } from "../helper";
  import browser from "webextension-polyfill";

  import { Lens } from "../icons";
  import ListItem from "../components/ListItem.svelte";
  import ShareToast from "../components/ShareToast.svelte";

  export let users: User[];
  export let credentialsFields: CredentialFields[] = [];
  let selectedUsers: UserWithAccessType[] = [];
  let showOptions = false;
  let selectionIndex: number | null = null;
  let topList = false;
  let shareToast = false;
  let searchInput = "";

  $: filteredUsers = searchInput
    ? users.filter((user) =>
        user.name.toLowerCase().includes(searchInput.toLowerCase())
      )
    : users;

  const shareCredentialHandler = async () => {
    const userData = await browser.runtime.sendMessage({
      action: "createShareCredPayload",
      data: {
        creds: credentialsFields,
        users: selectedUsers,
      },
    });

    const payload: ShareCredentialsWithUsersPayload = { userData };
    const shareStatus = await shareCredentialsWithUsers(payload);
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

  function handleCancel() {
    const dispatch = createEventDispatcher();
    dispatch("cancel", true);
  }
</script>

<div class="p-2 border border-osvauld-bordergreen rounded-lg max-h-[65vh]">
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

  {#if selectedUsers.length !== 0}
    <div
      class="overflow-y-auto scrollbar-thin min-h-0 max-h-[17.5vh] bg-osvauld-bordergreen rounded-lg w-full p-0.5 border border-osvauld-iconblack mt-1"
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
    </div>
  {/if}
  <div
    class="overflow-y-auto scrollbar-thin min-h-[17.5vh] max-h-[35vh] bg-osvauld-frameblack w-full"
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
  {#if selectedUsers.length !== 0}
    <div class="p-2 flex justify-between items-center box-border">
      <button
        class="w-[45%] px-4 py-2 secondary-btn whitespace-nowrap"
        on:click={handleCancel}>Cancel</button
      >

      <button
        class="w-[45%] px-4 py-2 bg-osvauld-carolinablue text-osvauld-frameblack rounded-md"
        on:click={shareCredentialHandler}>Share</button
      >
    </div>
  {/if}
  {#if shareToast}
    <ShareToast
      message={"Shared with Users"}
      on:close={() => (shareToast = !shareToast)}
    />
  {/if}
</div>
