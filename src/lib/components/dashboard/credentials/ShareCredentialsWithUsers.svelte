<script lang="ts">
    import {
        User,
        UserWithAccessType,
        EncryptedCredentialFields,
        ShareCredentialsWithUsersPayload,
    } from "../dtos";
    import { shareCredentialsWithUsers } from "../apis";
    import { createShareCredsPayload } from "../helper";
    import Lens from "../../basic/lens.svelte";
    import ListItem from '../components/ListItem.svelte';

    export let users: User[];
    export let encryptedCredentials: EncryptedCredentialFields[];
    let selectedUsers: UserWithAccessType[] = [];
    let showOptions = false; 
    let selectionIndex = null;
    let topList = false;

    const shareCredentialHandler = async () => {
        const userData = await createShareCredsPayload(
            encryptedCredentials,
            selectedUsers,
        );
        const payload: ShareCredentialsWithUsersPayload = { userData };
        await shareCredentialsWithUsers(payload);
    };

    function handleClick(index: number, isSelectedList: boolean){
        showOptions = !showOptions
        selectionIndex = index
        topList = isSelectedList
    }

    function handleItemRemove(index: number){
        const removedUser = selectedUsers.splice(index, 1)
        selectedUsers = [...selectedUsers]
        const [{ accessType, ...userWithoutAccessType }] = removedUser;
        users = [...users, { ...userWithoutAccessType}]
    }

    function handleRoleChange(e: any, index: number, type: string){
        const user = e.detail.user;
        const option = e.detail.permission;
        showOptions = !showOptions
        selectionIndex = null
       if(type === "selectedUsers"){
            selectedUsers.splice(index, 1)
            selectedUsers = [...selectedUsers, { ...user, accessType: option }];
       } else {
            selectedUsers = [...selectedUsers, { ...user, accessType: option }];
            users = users.filter((u) => u.id !== user.id);
       }
    }

    function setbackground(type: string){
        const typeToClassMap = {
        read: "bg-osvauld-readerOrange text-osvauld-readerText",
        write: "bg-osvauld-managerPurple text-osvauld-managerText",
        owner: "bg-osvauld-ownerGreen text-osvauld-ownerText"
       };

       return typeToClassMap[type] || "";
    }
</script>

<div class="p-2 border border-osvauld-bordergreen rounded-lg h-[70vh]">

    <div class="h-[30px] w-full px-2 mx-auto flex justify-start items-center border border-osvauld-bordergreen rounded-lg cursor-pointer">
        <Lens/>
        <input type="text" class="h-[28px] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite  placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer" placeholder="Search for users">
    </div>

    <div class="border border-osvauld-bordergreen my-1 w-full mb-1"></div>

    <div class="overflow-y-auto scrollbar-thin h-[50vh] bg-osvauld-frameblack w-full">
        {#each selectedUsers as user, index}
            <ListItem
            {user}
            isSelected={index === selectionIndex && topList}
            isTopList={true}
            on:click =  {()=>handleClick(index, true)}
            on:remove = {() => handleItemRemove(index)}
            {setbackground}
            {showOptions}
            on:select={(e)=> handleRoleChange(e,index, 'selectedUsers')}
             />
        {/each}
        {#each users as user, index}
        <ListItem
            {user}
            isSelected={index === selectionIndex && !topList}
            isTopList={false}
            on:click =  {()=>handleClick(index,false)}
            {setbackground}
            {showOptions}
            on:select={(e)=> handleRoleChange(e,index, 'users')}
             />
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
