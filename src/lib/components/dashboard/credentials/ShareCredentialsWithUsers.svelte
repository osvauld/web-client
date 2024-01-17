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
    import BinIcon from "../../basic/binIcon.svelte";
    import DownArrow from "../../basic/downArrow.svelte";
    export let users: User[];
    export let encryptedCredentials: EncryptedCredentialFields[];

    let selectedUsers: UserWithAccessType[] = [];
    let showOptions = false; 
    let selectionIndex = null
    let permissionSelected = false;
    let topList = false;
    let arrowColor = null;

    // function handleCheck(e: any, user: User) {
    //     if (e.target.checked) {
    //         selectedUsers = [...selectedUsers, { ...user, accessType: "read" }];
    //     } else {
    //         selectedUsers = selectedUsers.filter((u) => u.id !== user.id);
    //     }
    // }

    // const handleRoleChange = (e: any, user: User) => {
    //     const index = selectedUsers.findIndex((u) => u.id === user.id);
    //     selectedUsers[index].accessType = e.target.value;
    // };
    const shareCredentialHandler = async () => {
        const userData = await createShareCredsPayload(
            encryptedCredentials,
            selectedUsers,
        );
        const payload: ShareCredentialsWithUsersPayload = { userData };
        await shareCredentialsWithUsers(payload);
    };

    function handleClick(index: number, isSelectedList: boolean){
        console.log('click detected');
        showOptions = !showOptions
        selectionIndex = index
        topList = isSelectedList
    }

    function handleItemRemove(user: UserWithAccessType){
        selectedUsers = selectedUsers.filter((u) => u.id !== user.id);
        const { accessType, ...userWithoutAccessType } = user;
        users = [...users, { ...userWithoutAccessType}]
    }

    function handleRoleChange(option: string, user: User){
        showOptions = !showOptions
        selectionIndex = null
        const index = selectedUsers.findIndex((u) => u.id === user.id);
        if(index !== -1){
            selectedUsers = selectedUsers.filter((u) => u.id !== user.id);
            selectedUsers = [...selectedUsers, { ...user, accessType: option }];
        } else {
            selectedUsers = [...selectedUsers, { ...user, accessType: option }];
            users = users.filter((u) => u.id !== user.id);
        }
        console.log(showOptions, selectionIndex);
    }

    function setbackground(type: string){
        if(type === 'read'){
            return "bg-osvauld-readerOrange text-osvauld-readerText"
        } else if(type === "write"){
            return "bg-osvauld-managerPurple text-osvauld-managerText"
        } else {
            return "bg-osvauld-ownerGreen text-osvauld-ownerText"
        }
    }
    /* eslint-disable */
</script>

<div class="p-2 border border-osvauld-bordergreen rounded-lg h-[65vh]">

    <div class="h-[30px] w-full px-2 mx-auto flex justify-start items-center border border-osvauld-bordergreen rounded-lg cursor-pointer mb-2">
        <Lens/>
        <input type="text" class="h-[28px] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite  placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer" placeholder="Search for users">
    </div>

    <div class="border border-osvauld-bordergreen my-1 w-full mb-1"></div>

    <div class="overflow-y-auto scrollbar-thin h-[50vh] bg-osvauld-frameblack w-full">
        {#each selectedUsers as user, index}
        <div
            class=" relative w-[95%] my-2 px-2 border border-osvauld-bordergreen rounded-lg cursor-pointer flex items-center justify-between {index === selectionIndex && topList ? "bg-osvauld-bordergreen" : ""}" >
            <div class="flex items-center space-x-4">
                <p class="p-2 w-3/4 whitespace-nowrap">{user.name}</p>
            </div>
            <div class="flex justify-center items-center">
                <button class="w-[100px] rounded-md cursor-pointer px-2 py-1 pl-2 flex justify-between items-center   {setbackground(user.accessType)}" on:click={() => handleClick(index, true)}>{user.accessType}
                <span><DownArrow type={user.accessType}/></span>
                </button>
                {#if showOptions && topList && index === selectionIndex}
                    <div
                        class="absolute top-2 right-5 !z-50 w-[140px] h-[110px] bg-osvauld-frameblack border-osvauld-bordergreen  ml-auto flex flex-col justify-center items-center"
                    >
                        <button class="w-full rounded-md cursor-pointer px-2 py-1 bg-osvauld-readerOrange text-osvauld-readerText m-1" on:click|stopPropagation={() => handleRoleChange('read', user)}>Read</button>
                        <button class="w-full rounded-md cursor-pointer px-2 py-1 bg-osvauld-managerPurple text-osvauld-managerText m-1" on:click|stopPropagation={() => handleRoleChange('write', user)}>Write</button>
                        <button class="w-full rounded-md cursor-pointer px-2 py-1 bg-osvauld-ownerGreen text-osvauld-ownerText m-1" on:click|stopPropagation={() => handleRoleChange('owner', user)}>Owner</button>
                    </div>
                {/if}
                <button class="ml-2" on:click={()=> handleItemRemove(user)}><BinIcon/></button>
            </div>
        </div>
        {/each}
        {#each users as user, index}
       
        <div
            class=" relative w-[95%] my-2 px-2 border border-osvauld-bordergreen rounded-lg cursor-pointer flex items-center justify-between {index === selectionIndex && !topList ? "bg-osvauld-bordergreen" : ""}" on:click={() => handleClick(index,false)}>
            <div class="flex items-center space-x-4">
                <p class="p-2">{user.name}</p>
            </div>
            {#if showOptions && !topList && index === selectionIndex}
                <div
                    class="absolute top-2 right-0  !z-50 w-[170px] h-[110px] bg-osvauld-frameblack border-osvauld-bordergreen  ml-auto flex flex-col justify-center items-center"
                >
                    <button class="w-full rounded-md cursor-pointer px-2 py-1 bg-osvauld-readerOrange text-osvauld-readerText m-1" on:click|stopPropagation={() => handleRoleChange('read', user)}>Read</button>
                    <button class="w-full rounded-md cursor-pointer px-2 py-1 bg-osvauld-managerPurple text-osvauld-managerText m-1" on:click|stopPropagation={() => handleRoleChange('write', user)}>Write</button>
                    <button class="w-full rounded-md cursor-pointer px-2 py-1 bg-osvauld-ownerGreen text-osvauld-ownerText m-1" on:click|stopPropagation={() => handleRoleChange('owner', user)}>Owner</button>
                </div>
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
