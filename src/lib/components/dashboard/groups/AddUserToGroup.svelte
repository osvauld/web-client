<script lang="ts">
    import { onMount } from "svelte";
    import {
        fetchGroupUsers,
        fetchAllUsers,
        addUserToGroup,
        fetchCredentialFieldsByGroupId,
        fetchUsersWithoutGroupAccess,
    } from "../apis";
    import { CredentialFields } from "../dtos";
    import { createShareCredsPayload } from "../helper";

    import { User } from "../dtos";
    import { selectedGroup, showAddUserToGroupDrawer } from "../store";

    let users: User[] = [];
    let credentialFields: CredentialFields[] = [];
    onMount(async () => {
        if (!$selectedGroup) return;
        const userGroup = await fetchUsersWithoutGroupAccess(
            $selectedGroup.groupId,
        );
        users = userGroup.data;
        const credentialFieldsResponse = await fetchCredentialFieldsByGroupId(
            $selectedGroup.groupId,
        );
        credentialFields = credentialFieldsResponse.data;
    });

    const addUsertoGroup = async (user: User) => {
        const userData = await createShareCredsPayload(
            credentialFields,
            // @ts-ignore
            [user],
        );
        if ($selectedGroup === null) {
            throw new Error("Group not selected");
        }
        const payload = {
            groupId: $selectedGroup.groupId,
            memberId: user.id,
            memberRole: "member",
            credentials: userData[0].credentials,
        };
        await addUserToGroup(payload);
        users = users.filter((u) => u.id !== user.id);
    };
</script>

<div
    class="bg-osvauld-frameblack border border-osvauld-iconblack w-[40vw] h-[70vh] overflow-y-scroll scrollbar-thin p-4"
>
    <button
        class="bg-osvauld-carolinablue w-full text-macchiato-crust px-10 py-2"
        on:click={() => showAddUserToGroupDrawer.set(false)}>Close</button
    >

    {#each users as user}
        <li class="list-none">
            <div class="p-2 flex justify-between">
                {user.name}
                <button
                    class="bg-osvauld-cretangreen text-macchiato-base p-2"
                    on:click={() => addUsertoGroup(user)}>Add user</button
                >
            </div>
        </li>
    {/each}
</div>
