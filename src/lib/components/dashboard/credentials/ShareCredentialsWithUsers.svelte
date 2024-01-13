<script lang="ts">
    import {
        User,
        UserWithAccessType,
        EncryptedCredentialFields,
        ShareCredentialsWithUsersPayload,
    } from "../dtos";
    import { shareCredentialsWithUsers } from "../apis";
    import { createShareCredsPayload } from "../helper";
    export let users: User[];
    export let encryptedCredentials: EncryptedCredentialFields[];

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
    const shareCredentialHandler = async () => {
        const userData = await createShareCredsPayload(
            encryptedCredentials,
            selectedUsers,
        );
        const payload: ShareCredentialsWithUsersPayload = { userData };
        await shareCredentialsWithUsers(payload);
    };
</script>

{#each users as user}
    <div
        class="p-4 rounded-xl border border-transparent hover:border-macchiato-mauve flex items-center justify-between"
    >
        <div class="flex items-center space-x-4">
            <input type="checkbox" on:change={(e) => handleCheck(e, user)} />
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

<div class="p-4">
    <button
        class="w-full p-4 bg-macchiato-sapphire text-macchiato-surface0 rounded-md"
        on:click={shareCredentialHandler}>Share</button
    >
</div>
