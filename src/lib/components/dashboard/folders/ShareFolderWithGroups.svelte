<script lang="ts">
  import {
    Group,
    CredentialFields,
    ShareFolderWithGroupsPayload,
  } from "../dtos";
  import {
    fetchUsersByGroupIds,
    shareFolderWithGroups,
    fetchGroupsWithoutAccess,
    fetchFolderGroups,
  } from "../apis";
  import { createEventDispatcher } from "svelte";
  import { sendMessage, setbackground } from "../helper";
  import { writable } from "svelte/store";
  import { selectedFolder, toastStore } from "../store";
  import { onMount } from "svelte";
  import { Lens } from "../icons";
  import ListItem from "../components/ListItem.svelte";
  const dispatch = createEventDispatcher();
  let groups: Group[] = [];
  export let credentialsFields: CredentialFields[];

  let selectedGroups = writable(new Map<string, Group>());
  let showOptions = false;
  let selectionIndex: number | null = null;
  let topList = false;
  let searchInput = "";
  let existingItemDropdown = false;
  let existingGroupsData: Group[] = [];

  $: filteredGroups = searchInput
    ? groups.filter((group) =>
        group.name.toLowerCase().includes(searchInput.toLowerCase())
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
    toastStore.set({
      type: "success",
      message: shareStatus.message,
      show: true,
    });
    dispatch("cancel", true);
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

  onMount(async () => {
    // TODO: change fetch all groups to fetch groups where folder not shared.
    if ($selectedFolder === null) throw new Error("Folder not selected");
    const responseJson = await fetchGroupsWithoutAccess($selectedFolder.id);
    groups = responseJson.data;
  });

  function handleCancel() {
    dispatch("cancel", true);
  }
</script>

<div
  class="p-2 border border-osvauld-iconblack rounded-lg min-h-[10rem] max-h-[15rem]"
>
  <div class="bg-osvauld-frameblack flex justify-center items-center">
    <div
      class="h-[1.875rem] w-full px-2 mx-auto flex justify-start items-center border border-osvauld-iconblack rounded-lg cursor-pointer"
    >
      <Lens />
      <input
        type="text"
        bind:value={searchInput}
        class="h-[1.75rem] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
        placeholder="Search for groups"
      />
    </div>
  </div>

  <div
    class="overflow-y-auto scrollbar-thin min-h-0 max-h-[11rem] bg-osvauld-frameblack w-full flex flex-col justify-center items-center"
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
</div>

{#if $selectedGroups.size !== 0}
  <div
    class="my-2 border border-osvauld-iconblack rounded-lg min-h-0 max-h-[8rem] mb-2"
  >
    <div
      class="overflow-y-scroll scrollbar-thin min-h-0 max-h-[6rem] rounded-lg w-full px-2 mt-1"
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
        <div class=" border-osvauld-iconblack w-full"></div>
      {/each}
    </div>
  </div>
{/if}
<div class="p-2 w-full flex justify-end items-center box-border">
  <button
    class="ml-auto p-2 whitespace-nowrap text-sm font-medium text-osvauld-fadedCancel"
    on:click={handleCancel}>Cancel</button
  >

  <button
    class="ml-4 px-3 py-2 whitespace-nowrap text-sm font-medium border border-osvauld-iconblack text-osvauld-textActive hover:bg-osvauld-carolinablue hover:text-osvauld-frameblack rounded-md hover:border-transparent"
    on:click={shareFolderHandler}>Save changes</button
  >
</div>
