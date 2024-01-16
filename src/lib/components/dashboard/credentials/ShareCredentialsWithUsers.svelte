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
    import BinIcon from "../../basic/binIcon.svelte"
    export let users: User[];
    export let encryptedCredentials: EncryptedCredentialFields[];

    let selectedUsers: UserWithAccessType[] = [];

    $: sortedUsers = users.slice().sort((a, b) => {
        const aSelected = selectedUsers.some(u => u.id === a.id);
        const bSelected = selectedUsers.some(u => u.id === b.id);
        return bSelected - aSelected;
    });

    function handleItemClick(e: any, user: User){
        console.log('click registerd at top level');
        if(e.target.tagName.toLowerCase() === 'select'){
            return
        } 
        const index = selectedUsers.findIndex(u => u.id === user.id);
        if(index === -1){
            selectedUsers = [...selectedUsers, { ...user, accessType: "read" }];
            user.selectedOption = "read";
        } else {
            selectedUsers = selectedUsers.filter((u) => u.id !== user.id);
            user.selectedOption = "default";
        }
    
    }

    function handleItemRemove(e: any, user: User){
        const index = selectedUsers.findIndex(u => u.id === user.id);
        if(index !== -1){
            selectedUsers = selectedUsers.filter((u) => u.id !== user.id);
            user.selectedOption = "default";
        }
    }

    function handleItemSelection(e: any, user: User) {
        if(e.target.value === "default"){
            user.selectedOption = e.target.value;
            selectedUsers = selectedUsers.filter((u) => u.id !== user.id);
            return 
        } 
       
        const index = selectedUsers.findIndex(u => u.id === user.id);
        if(index !== -1){
            selectedUsers = selectedUsers.filter((u) => u.id !== user.id);
            selectedUsers = [...selectedUsers, { ...user, accessType: e.target.value }];
        } else {
            user.selectedOption = e.target.value;
            selectedUsers = [...selectedUsers, { ...user, accessType: e.target.value }];
        }
        
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

    <div class="border border-osvauld-bordergreen my-1 w-full mb-1"></div>

    <div class="overflow-y-auto scrollbar-thin h-[50vh] bg-osvauld-frameblack w-full">
        {#each sortedUsers as user}
            <div
                class="w-full my-2 px-2 border border-osvauld-bordergreen rounded-lg cursor-pointer flex items-center justify-between {selectedUsers.some(anySelectedUser => anySelectedUser.id === user.id) ? "bg-osvauld-bordergreen text-osvauld-highlightwhite": ""}" on:click={(e) => handleItemClick(e, user)}
            >
                <div class="w-full flex items-center justify-between" >
                    <div class="flex items-center justify-center">
                        <label class="p-1 pl-3 font-normal text-base cursor-pointer">{user.name}</label>
                    </div>
                        <select
                        class="bg-osvauld-bordergreen border-0 rounded-lg {user.selectedOption === 'read' ? "bg-osvauld-readerOrange":""} {user.selectedOption === 'write' ? "bg-osvauld-managerPurple":""} {user.selectedOption === 'owner' ? "bg-osvauld-ownerGreen":""}"
                        bind:value={user.selectedOption} 
                        on:change={(e) => handleItemSelection(e, user)}
                        >  
                           <option value="default">permission</option>
                            <option value="read">Reader</option>
                            <option value="write">Manager</option>
                            <option value="owner">Owner</option>
                        </select>
                </div>
                {#if selectedUsers.some(anySelectedUser => anySelectedUser.id === user.id)}
                   <span><BinIcon/></span>
                {/if}
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
