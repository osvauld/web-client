<script lang="ts">
  import {
    Group,
    CredentialFields,
    ShareCredentialsWithGroupsPayload,
  } from "../dtos";
  import { writable } from "svelte/store";
  import { fetchUsersByGroupIds, shareCredentialsWithGroups } from "../apis";
  import { sendMessage, setbackground } from "../helper";

  import { Lens } from "../icons";
  import ListItem from "../components/ListItem.svelte";
  import { toastStore } from "../store";
  import { createEventDispatcher, onMount } from "svelte";
  const dispatch = createEventDispatcher();
  export let groups: Group[];
  export let credentialsFields: CredentialFields[];
  let selectedGroups = writable(new Map<string, Group>());
  let showOptions = false;
  let selectionIndex: number | null = null;
  let topList = false;
  let searchInput = "";

  $: $selectedGroups.size == 0 && dispatch("enable", false);

  $: filteredGroups = searchInput
    ? groups.filter((group) =>
        group.name.toLowerCase().includes(searchInput.toLowerCase())
      )
    : groups;

  export const shareCredentialHandler = async () => {
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

    toastStore.set({
      type: shareStatus.success,
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
    $selectedGroups.size !== 0 && dispatch("enable", true);
  }

  onMount(() => {
    //Below will disable save changes button when group/user button switched
    dispatch("enable", false);
  });
</script>

<div class="p-2 pl-2 rounded-lg w-full">
  <div
    class="h-[1.875rem] w-full px-2 mx-auto flex justify-start items-center cursor-pointer border rounded-lg border-osvauld-iconblack"
  >
    <Lens />
    <input
      type="text"
      bind:value={searchInput}
      class="h-[1.75rem] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
      placeholder=""
    />
  </div>

  <div
    class="overflow-y-scroll scrollbar-thin h-[20rem] bg-osvauld-frameblack w-full"
  >
    {#each filteredGroups as group, index}
      <ListItem
        item={group}
        isSelected={index === selectionIndex && !topList}
        isBottomList={false}
        on:click={() => handleClick(index, false)}
        {setbackground}
        {showOptions}
        reverseModal={filteredGroups.length > 3 &&
          index > filteredGroups.length - 3}
        on:select={(e) => handleRoleChange(e, index, "groups")}
      />
    {/each}
  </div>
</div>

{#if $selectedGroups.size !== 0}
  <div
    class="overflow-y-scroll overflow-x-hidden scrollbar-thin h-[8rem] bg-osvauld-frameblack rounded-lg w-full p-0.5 border border-osvauld-iconblack mt-auto !text-osvauld-textActive"
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
        reverseModal={$selectedGroups.size > 3 &&
          index > $selectedGroups.size - 3}
        on:select={(e) => handleRoleChange(e, index, "selectedGroups")}
      />
    {/each}
  </div>
{/if}
