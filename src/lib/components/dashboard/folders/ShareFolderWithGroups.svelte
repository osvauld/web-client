<script lang="ts">
    import {
        Group,
        GroupWithAccessType,
        EncryptedCredentialFields,
    } from "../dtos";
    import {
        fetchUsersByGroupIds,
        shareFolderWithGroups,
        fetchAllUserGroups,
    } from "../apis";
    import { createShareCredsPayload } from "../helper";
    import { selectedFolder } from "../store";
    import { onMount } from "svelte";
    let groups: Group[] = [];
    export let encryptedCredentials: EncryptedCredentialFields[];

    let selectedGroups = new Map<string, GroupWithAccessType>();

    function handleCheck(e: any, group: Group) {
        if (e.target.checked) {
            selectedGroups.set(group.groupId, { ...group, accessType: "read" });
        } else {
            selectedGroups.delete(group.groupId);
        }
    }

    const handleRoleChange = (e: any, group: Group) => {
        if (selectedGroups.has(group.groupId)) {
            const updatedGroup = {
                ...selectedGroups.get(group.groupId),
                accessType: e.target.value,
            };
            selectedGroups.set(group.groupId, updatedGroup);
        }
    };

    const shareFolderHandler = async () => {
        const groupIds = Array.from(selectedGroups.keys());
        const response = await fetchUsersByGroupIds(groupIds);
        const groupUsersList = response.data;
        const payload = [];
        for (const groupUsers of groupUsersList) {
            const group = selectedGroups.get(groupUsers.groupId);
            const encryptedUserData = await createShareCredsPayload(
                encryptedCredentials,
                groupUsers.userDetails,
            );
            payload.push({
                groupId: group.groupId,
                accessType: group.accessType,
                encryptedUserData,
            });
        }
        await shareFolderWithGroups({
            folderId: $selectedFolder.id,
            groupData: payload,
        });
    };
    onMount(async () => {
        // TODO: change fetch all groups to fetch groups where folder not shared.
        groups = await fetchAllUserGroups();
    });
</script>

{#each groups as group}
    <div
        class="p-4 rounded-xl border border-transparent hover:border-macchiato-mauve flex items-center justify-between"
    >
        <div class="flex items-center space-x-4">
            <input type="checkbox" on:change={(e) => handleCheck(e, group)} />
            <p class="p-2">{group.name}</p>
        </div>
        <select
            class="bg-macchiato-overlay0 ml-auto"
            on:change={(e) => handleRoleChange(e, group)}
        >
            <option value="read">Read</option>
            <option value="write">Write</option>
            <option value="owner">Owner</option>
        </select>
    </div>
{/each}

<div class="p-4">
    <button
        class="w-full p-4 bg-macchiato-sapphire text-macchiato-surface0 rounded-md"
        on:click={shareFolderHandler}>Share</button
    >
</div>
