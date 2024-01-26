<script lang="ts">
    import {
        Group,
        GroupWithAccessType,
        CredentialFields,
        ShareFolderWithGroupsPayload,
    } from "../dtos";
    import {
        fetchUsersByGroupIds,
        shareFolderWithGroups,
        fetchGroupsWithoutAccess,
        fetchFolderGroups,
    } from "../apis";
    import { createShareCredsPayload, setbackground } from "../helper";
    import { writable } from "svelte/store";
    import { selectedFolder } from "../store";
    import { onMount } from "svelte";
    import { Lens } from "../icons";
    import ListItem from "../components/ListItem.svelte";
    import ExistingListParent from "../components/ExistingListParent.svelte";
    import ShareToast from "../components/ShareToast.svelte";

    let groups: Group[] = [];
    export let credentialsFields: CredentialFields[];

    let selectedGroups = writable(new Map<string, GroupWithAccessType>());
    let showOptions = false;
    let selectionIndex = null;
    let topList = false;
    let searchInput = "";
    let shareToast = false;
    let existingItemDropdown = false;
    let existingGroupsData: GroupWithAccessType[] = [];

    $: filteredGroups = searchInput
        ? groups.filter((group) =>
              group.name.toLowerCase().includes(searchInput.toLowerCase()),
          )
        : groups;

    const existingGroups = async () => {
        existingItemDropdown = !existingItemDropdown;
        if (existingGroupsData.length === 0) {
            console.log("inside existingGroups");
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
        console.log(groupUsersList, "GroupUsersList");
        const payload: ShareFolderWithGroupsPayload = {
            folderId: $selectedFolder.id,
            groupData: [],
        };
        for (const groupUsers of groupUsersList) {
            const group = $selectedGroups.get(groupUsers.groupId);
            const userData = await createShareCredsPayload(
                credentialsFields,
                // @ts-ignore
                groupUsers.userDetails,
            );
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
        let removedUser;
        selectedGroups.update((currentGroups) => {
            removedUser = currentGroups.get(id);
            currentGroups.delete(id);
            return currentGroups;
        });
        groups = [...groups, { ...removedUser }];
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
        const responseJson = await fetchGroupsWithoutAccess($selectedFolder.id);
        groups = responseJson.data;
    });
</script>

<div class="p-2 border border-osvauld-bordergreen rounded-lg h-[50vh]">
    <div
        class="h-[30px] w-full px-2 mx-auto flex justify-start items-center border border-osvauld-bordergreen rounded-lg cursor-pointer"
    >
        <Lens />
        <input
            type="text"
            bind:value={searchInput}
            class="h-[28px] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
            placeholder="Search for users"
        />
    </div>

    <div class="border border-osvauld-bordergreen my-1 w-full mb-1"></div>

    <div
        class="overflow-y-auto scrollbar-thin h-[35vh] bg-osvauld-frameblack w-full"
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
    existingItemsData={existingGroupsData}
    user={false}
    on:click={existingGroups}
/>
