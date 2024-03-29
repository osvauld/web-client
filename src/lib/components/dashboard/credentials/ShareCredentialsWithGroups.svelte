<script lang="ts">
  import {
    Group,
    GroupWithAccessType,
    CredentialFields,
    ShareCredentialsWithGroupsPayload,
  } from "../dtos";
  import { writable } from "svelte/store";
  import { fetchUsersByGroupIds, shareCredentialsWithGroups } from "../apis";
  import { sendMessage, setbackground } from "../helper";
  import browser from "webextension-polyfill";

  import { Lens } from "../icons";
  import ListItem from "../components/ListItem.svelte";
  import ShareToast from "../components/ShareToast.svelte";
  export let groups: Group[];
  export let credentialsFields: CredentialFields[];
  let selectedGroups = writable(new Map<string, GroupWithAccessType>());
  let showOptions = false;
  let selectionIndex: number | null = null;
  let topList = false;
  let searchInput = "";
  let shareToast = false;

  $: filteredGroups = searchInput
    ? groups.filter((group) =>
        group.name.toLowerCase().includes(searchInput.toLowerCase()),
      )
    : groups;

  const shareCredentialHandler = async () => {
    const groupIds = Array.from($selectedGroups.keys());
    const response = await fetchUsersByGroupIds(groupIds);
    const groupUsersList = response.data;
    const payload: ShareCredentialsWithGroupsPayload = {
      groupData: [],
    };
    for (const groupUsers of groupUsersList) {
      const group = $selectedGroups.get(groupUsers.groupId);
      if (group == undefined) continue;
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
    const shareStatus = await shareCredentialsWithGroups(payload);

    shareToast = shareStatus.success === true;
  };
  function handleClick(index: number, isSelectedList: boolean) {
    showOptions = !showOptions;
    selectionIndex = index;
    topList = isSelectedList;
  }

  function handleItemRemove(id: string) {
    let removedGroup: GroupWithAccessType | undefined;
    selectedGroups.update((currentGroups) => {
      if (currentGroups.has(id)) {
        removedGroup = currentGroups.get(id);
        currentGroups.delete(id);
      }
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
</script>

<div class="p-2 border border-osvauld-bordergreen rounded-lg h-[70vh]">
  <div
    class="h-[1.875rem] w-full px-2 mx-auto flex justify-start items-center border border-osvauld-bordergreen rounded-lg cursor-pointer"
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
    class="overflow-y-auto scrollbar-thin h-[50vh] bg-osvauld-frameblack w-full"
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

  <div class="p-2 flex justify-between items-center box-border">
    <button class="w-[45%] px-4 py-2 secondary-btn whitespace-nowrap"
      >Cancel</button
    >

    <button
      class="w-[45%] px-4 py-2 bg-osvauld-carolinablue text-osvauld-frameblack rounded-md"
      on:click={shareCredentialHandler}>Share</button
    >
  </div>
  {#if shareToast}
    <ShareToast
      message={"Shared with groups"}
      on:close={() => (shareToast = !shareToast)}
    />
  {/if}
</div>
