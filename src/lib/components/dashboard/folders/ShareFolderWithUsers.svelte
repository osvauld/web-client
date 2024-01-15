<script lang="ts">
    import {
        fetchEncryptedCredentialsFields,
        shareFolderWithUsers,
    } from "../apis";
    import {
        User,
        UserWithAccessType,
        ShareFolderWithUsersPayload,
        EncryptedCredentialFields,
    } from "../dtos";
    import { selectedFolder, showFolderShareDrawer } from "../store";

    import { createShareCredsPayload } from "../helper";
    export let users: User[];
    export let creds;
    let selectedUsers: UserWithAccessType[] = [];

    function handleCheck(e: any, user: User) {
        if (e.target.checked) {
            selectedUsers = [...selectedUsers, { ...user, accessType: "read" }];
        } else {
            selectedUsers = selectedUsers.filter((u) => u.id !== user.id);
        }
    }

    const handleRoleChange = (e: any, user: User) => {
        const index = selectedUsers.findIndex((u) => u.id === user.id);
        selectedUsers[index].accessType = e.target.value;
    };

    const shareFolderHandler = async () => {
        const userData = await createShareCredsPayload(creds, selectedUsers);
        const shareFolderPayload: ShareFolderWithUsersPayload = {
            folderId: $selectedFolder.id,
            userData,
        };
        await shareFolderWithUsers(shareFolderPayload);
        // showFolderShareDrawer.set(false);
    };
</script>

<div class="flex-grow overflow-y-auto max-h-[85vh] scrollbar-thin">
    {#each users as user}
        <div
            class="p-4 rounded-xl border border-transparent hover:border-macchiato-mauve flex items-center justify-between"
        >
            <div class="flex items-center space-x-4">
                <input
                    type="checkbox"
                    on:change={(e) => handleCheck(e, user)}
                />
                <p class="p-2">{user.name}</p>
            </div>
            <select
                class="bg-macchiato-overlay0 ml-auto"
                on:change={(e) => handleRoleChange(e, user)}
            >
                <option value="read">Read</option>
                <option value="write">Write</option>
                <option value="owner">Owner</option>
            </select>
        </div>
    {/each}
</div>
<div class="p-4">
    <button
        class="w-full p-4 bg-macchiato-sapphire text-macchiato-surface0 rounded-md"
        on:click={shareFolderHandler}>Share</button
    >
</div>
