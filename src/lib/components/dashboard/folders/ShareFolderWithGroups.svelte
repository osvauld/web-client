<script lang="ts">
  import {
    Group,
    Group,
    CredentialFields,
    ShareFolderWithGroupsPayload,
  } from "../dtos";
  import {
    fetchUsersByGroupIds,
    shareFolderWithGroups,
    fetchGroupsWithoutAccess,
    fetchFolderGroups,
    removeGroupFromFolder,
    editFolderPermissionForGroup,
  } from "../apis";
  import { createEventDispatcher } from "svelte";
  import { sendMessage, setbackground } from "../helper";
  import { writable } from "svelte/store";
  import { selectedFolder } from "../store";
  import { onMount } from "svelte";
  import { Lens } from "../icons";
  import ListItem from "../components/ListItem.svelte";
  import ExistingListParent from "../components/ExistingListParent.svelte";
  import ShareToast from "../components/ShareToast.svelte";

  let groups: Group[] = [];
  export let credentialsFields: CredentialFields[];

  let selectedGroups = writable(new Map<string, Group>());
  let showOptions = false;
  let selectionIndex: number | null = null;
  let topList = false;
  let searchInput = "";
  let shareToast = false;
  let existingItemDropdown = false;
  let existingGroupsData: Group[] = [];

  $: filteredGroups = searchInput
    ? groups.filter((group) =>
        group.name.toLowerCase().includes(searchInput.toLowerCase()),
      )
    : groups;

  const existingGroups = async (toggle = true) => {
    if (toggle) {
      existingItemDropdown = !existingItemDropdown;
    }
    if ($selectedFolder !== null) {
      const reponseJson = await fetchFolderGroups($selectedFolder.id);
      existingGroupsData = reponseJson.data;
    } else {
      existingGroupsData.length = 0;
    }
  };

  const shareFolderHandler = async () => {
    const groupIds = Array.from($selectedGroups.keys());
    const response = await fetchUsersByGroupIds(groupIds);
    const groupUsersList = response.data;
    if ($selectedFolder === null) throw new Error("Folder not selected");
    const payload: ShareFolderWithGroupsPayload = {
      folderId: $selectedFolder.id,
      groupData: [],
    };
    for (const groupUsers of groupUsersList) {
      const group = $selectedGroups.get(groupUsers.groupId);
      if (group === undefined) continue;
      const userData = await sendMessage("createShareCredPayload", {
        creds: credentialsFields,
        users: groupUsers.userDetails,
      });
      payload.groupData.push({
        groupId: group.groupId,
        accessType: group.accessType,
        userData,
      });
    }
    const shareStatus = await shareFolderWithGroups(payload);
    shareToast = shareStatus.success === true;
  };

  function handleClick(index: number, isSelectedList: boolean) {
    showOptions = !showOptions;
    selectionIndex = index;
    topList = isSelectedList;
  }

  function handleItemRemove(id: string) {
    let removedGroup: Group | undefined;
    selectedGroups.update((currentGroups) => {
      removedGroup = currentGroups.get(id);
      currentGroups.delete(id);
      return currentGroups;
    });
    if (removedGroup) {
      groups = [...groups, { ...removedGroup }];
    }
  }

  function handleRoleChange(e: any, index: number, type: string) {
    const item = e.detail.item;
    const option = e.detail.permission;
    showOptions = !showOptions;
    selectionIndex = null;

    if (type === "selectedGroups") {
      selectedGroups.update((currentGroups) => {
        currentGroups.set(item.groupId, {
          ...item,
          accessType: option,
        });
        return currentGroups;
      });
    } else {
      $selectedGroups.set(item.groupId, { ...item, accessType: option });
      groups = groups.filter((u) => u.groupId !== item.groupId);
    }
  }

  const removeExistingGroup = async (e: any) => {
    await removeGroupFromFolder($selectedFolder.id, e.detail.id);
    await existingGroups(false);
  };

  const handlePermissionChange = async (e: any) => {
    await editFolderPermissionForGroup(
      $selectedFolder.id,
      e.detail.item.id,
      e.detail.permission,
    );
    await existingGroups(false);
  };
  onMount(async () => {
    // TODO: change fetch all groups to fetch groups where folder not shared.
    if ($selectedFolder === null) throw new Error("Folder not selected");
    const responseJson = await fetchGroupsWithoutAccess($selectedFolder.id);
    groups = responseJson.data;
  });

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

  {#if $selectedGroups.size !== 0}
    <div
      class="overflow-y-auto scrollbar-thin min-h-0 max-h-[17.5vh] bg-osvauld-bordergreen rounded-lg w-full p-0.5 border border-osvauld-iconblack mt-1"
    >
      {#each Array.from($selectedGroups) as [groupId, group], index}
        <ListItem
          item={group}
          isSelected={index === selectionIndex && topList}
          isTopList={true}
          on:click={() => handleClick(index, true)}
          on:remove={() => handleItemRemove(groupId)}
          {setbackground}
          {showOptions}
          on:select={(e) => handleRoleChange(e, index, "selectedGroups")}
        />
      {/each}
    </div>
  {/if}
  <div
    class="overflow-y-auto scrollbar-thin min-h-0 max-h-[35vh] bg-osvauld-frameblack w-full"
  >
    {#each filteredGroups as group, index}
      <ListItem
        item={group}
        isSelected={index === selectionIndex && !topList}
        isTopList={false}
        on:click={() => handleClick(index, false)}
        {setbackground}
        {showOptions}
        on:select={(e) => handleRoleChange(e, index, "groups")}
      />
    {/each}
  </div>

  {#if $selectedGroups.size !== 0}
    <div class="p-2 flex justify-between items-center box-border">
      <button
        class="w-[45%] px-4 py-2 secondary-btn whitespace-nowrap"
        on:click={handleCancel}>Cancel</button
      >

      <button
        class="w-[45%] px-4 py-2 bg-osvauld-carolinablue text-macchiato-surface0 rounded-md"
        on:click={shareFolderHandler}>Share</button
      >
    </div>
  {/if}
  {#if shareToast}
    <ShareToast
      message={"Shared with groups"}
      on:close={() => (shareToast = !shareToast)}
    />
  {/if}
</div>

<ExistingListParent
  {existingItemDropdown}
  existingItemsData={existingGroupsData}
  user={false}
  on:click={() => existingGroups()}
  on:remove={(e) => removeExistingGroup(e)}
  on:permissionChange={(e) => handlePermissionChange(e)}
/>
