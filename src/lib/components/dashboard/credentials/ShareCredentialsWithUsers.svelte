<script lang="ts">
    import {
        User,
        UserWithAccessType,
        EncryptedCredentialFields,
        ShareCredentialsWithUsersPayload,
    } from "../dtos";
    import { shareCredentialsWithUsers } from "../apis";
    import { createShareCredsPayload } from "../helper";
    import Lens from "../../basic/lens.svelte"
    export let users: User[];
    export let encryptedCredentials: EncryptedCredentialFields[];

    let selectedUsers: UserWithAccessType[] = [];



    function handleItemClick(e: any, user: User){
        console.log('click detected');
        if(e.target.tagName.toLowerCase() === 'select'){
            console.log('inside click', 'inside select', e.target.value)
            selectedUsers = [...selectedUsers, { ...user, accessType: e.target.value }];
            console.log(selectedUsers)
            return
        } 
        const index = selectedUsers.findIndex(u => u.id === user.id);
        if(index === -1){
            selectedUsers = [...selectedUsers, { ...user, accessType: "read" }];
        } else {
            selectedUsers = selectedUsers.filter((u) => u.id !== user.id);
        }
        console.log(selectedUsers);
    }

    function handleItemSelection(e: any, user: User) {
        console.log('Role change detected Handle Item selection invoked')
        if(e.target.tagName.toLowerCase() === 'select'){
            const index = selectedUsers.findIndex(u => u.id === user.id);
            if(index !== -1){
                selectedUsers = selectedUsers.filter((u) => u.id !== user.id);
                selectedUsers = [...selectedUsers, { ...user, accessType: e.target.value }];
            }
            console.log(selectedUsers)
        } 
        // if (e.target?.checked) {
        //     selectedUsers = [...selectedUsers, { ...user, accessType: "read" }];
        // } else {
        //     console.log('Else condition invoked');
        //     selectedUsers = selectedUsers.filter((u) => u.id !== user.id);
        // }
    }


    const shareCredentialHandler = async () => {
        const userData = await createShareCredsPayload(
            encryptedCredentials,
            selectedUsers,
        );
        const payload: ShareCredentialsWithUsersPayload = { userData };
        await shareCredentialsWithUsers(payload);
    };

   /* eslint-disable */
</script>

<div class="p-2 border border-osvauld-bordergreen rounded-lg h-[65vh]">

    <div class="h-[30px] w-full px-2 mx-auto flex justify-start items-center border border-osvauld-bordergreen rounded-lg cursor-pointer mb-2">
        <Lens/>
        <input type="text" class="h-[28px] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite  placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer" placeholder="Search for users">
    </div>

    <div class="border border-osvauld-bordergreen my-1 w-full mb-2"></div>

    <div class="overflow-y-auto scrollbar-thin h-[50vh] bg-osvauld-frameblack w-full">
        {#each users as user}
            <div
                class="rounded-lg w-full cursor-pointer  hover:bg-osvauld-bordergreen flex items-center justify-between ${selectedUsers.some(anySelectedUser => anySelectedUser.id === user.id) ? "bg-osvauld-cretangreen": ""}" on:click={(e) => handleItemClick(e, user)}
            >
                <div class="w-full flex items-center justify-between" on:change={(e) => handleItemSelection(e, user)}>
                    <div class="flex items-center justify-center">
                        <label class="p-1 cursor-pointer">{user.name}</label>
                    </div>
                        <select
                        class="bg-osvauld-bordergreen border-0"
                        >
                            <option value="read">Reader</option>
                            <option value="write">Manager</option>
                            <option value="owner">Owner</option>
                        </select>
                </div>
               
            </div>
        {/each}
    </div>

    <div class="p-2 flex justify-between items-center box-border">
        <button class="w-[45%] px-4 py-2 bg-osvauld-iconblack border border-osvauld-placeholderblack rounded-md">Cancel</button>
        <button
            class="w-[45%] px-4 py-2 bg-osvauld-carolinablue text-macchiato-surface0 rounded-md"
            on:click={shareCredentialHandler}>Share</button
        >
    </div>

</div>
