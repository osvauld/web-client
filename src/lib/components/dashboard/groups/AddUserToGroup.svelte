<script lang="ts">
    import { onMount } from "svelte";
    import { fetchGroupUsers, fetchAllUsers, addUserToGroup } from "../apis";
    import { User } from "../dtos";
    import { selectedGroup, showAddUserToGroupDrawer } from "../store";
    let users: User[] = [];
    onMount(async () => {
        if (!$selectedGroup) return;
        const userGroupPromise = fetchGroupUsers($selectedGroup.groupId);
        const allUsersPromise = fetchAllUsers();
        const [userGroup, allUsers] = await Promise.all([
            userGroupPromise,
            allUsersPromise,
        ]);
        // TODO: API to fetch non group members.
        users = allUsers.filter(
            (user) => !userGroup.some((groupUser) => groupUser.id === user.id),
        );
    });

    const addUsertoGroup = async (user: User) => {
        const payload = {
            groupId: $selectedGroup.groupId,
            memberId: user.id,
            memberRole: "member",
            encryptedData: [],
        };
        await addUserToGroup(payload);
        users = users.filter((u) => u.id !== user.id);
    };
</script>

<div class="bg-macchiato-surface0">
    {#each users as user}
        <li>
            <div class="p-2 flex justify-between">
                {user.name}
                <button
                    class="bg-macchiato-teal text-macchiato-base p-2"
                    on:click={() => addUsertoGroup(user)}>Add user</button
                >
            </div>
        </li>
    {/each}
    <button
        class="bg-macchiato-rosewater text-macchiato-crust p-2"
        on:click={() => showAddUserToGroupDrawer.set(false)}>CLOSE</button
    >
</div>
