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
  $: $selectedGroups.size === 0 && dispatch("enable", false);
  $: filteredGroups = searchInput
    ? groups.filter((group) =>
        group.name.toLowerCase().includes(searchInput.toLowerCase())
      )
    : groups;

  export const shareFolderHandler = async () => {
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
      type: shareStatus.success,
      message: "Successfully shared",
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

    $selectedGroups.size !== 0 && dispatch("enable", true);
  }

  onMount(async () => {
    // TODO: change fetch all groups to fetch groups where folder not shared.
    if ($selectedFolder === null) throw new Error("Folder not selected");
    //Below will disable save changes button when group/user button switched
    dispatch("enable", false);

    const responseJson = await fetchGroupsWithoutAccess($selectedFolder.id);
    groups = responseJson.data;
  });
</script>

<div class="p-2 w-full max-h-full rounded-lg overflow-hidden">
  <div class="bg-osvauld-frameblack flex justify-center items-center">
    <div
      class="h-[1.875rem] w-full px-2 mx-auto flex justify-start items-center border border-osvauld-iconblack rounded-lg cursor-pointer"
    >
      <Lens />
      <input
        type="text"
        bind:value={searchInput}
        class="h-[1.75rem] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
        placeholder=""
      />
    </div>
  </div>

  <div
    class="overflow-y-scroll scrollbar-thin bg-osvauld-frameblack w-full max-h-[15rem] min-h-[8rem] flex flex-col justify-start items-center"
  >
    {#each filteredGroups as group, index}
      <ListItem
        item={group}
        isSelected={index === selectionIndex && !topList}
        isBottomList={false}
        on:click={() => handleClick(index, false)}
        {setbackground}
        {showOptions}
        reverseModal={filteredGroups.length > 4 &&
          index > filteredGroups.length - 3}
        on:select={(e) => handleRoleChange(e, index, "groups")}
      />
    {/each}
  </div>
</div>

{#if $selectedGroups.size !== 0}
  <div
    class="my-2 w-full border border-osvauld-iconblack rounded-lg h-[8rem] mb-2"
  >
    <div
      class="overflow-y-scroll h-[90%] scrollbar-thin rounded-lg w-full px-2 mt-1"
    >
      {#each Array.from($selectedGroups) as [groupId, group], index}
        <ListItem
          item={group}
          isSelected={index === selectionIndex && topList}
          isBottomList={true}
          on:click={() => handleClick(index, true)}
          on:remove={() => handleItemRemove(groupId)}
          {setbackground}
          {showOptions}
          reverseModal={$selectedGroups.size > 1 && index > 1}
          on:select={(e) => handleRoleChange(e, index, "selectedGroups")}
        />
        <div class="border-b border-osvauld-iconblack w-full"></div>
      {/each}
    </div>
  </div>
{/if}
