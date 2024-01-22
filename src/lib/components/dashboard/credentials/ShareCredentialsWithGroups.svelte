<script lang="ts">
    import {
        Group,
        GroupWithAccessType,
        EncryptedCredentialFields,
    } from "../dtos";
    import { fetchUsersByGroupIds, shareCredentialsWithGroups } from "../apis";
    import { createShareCredsPayload } from "../helper";
    import { Lens } from "../icons"
    import ListItem from '../components/ListItem.svelte';


    export let groups: Group[];
    export let encryptedCredentials: EncryptedCredentialFields[];
    let selectedGroups = new Map<string, GroupWithAccessType>();
    let showOptions = false; 
    let selectionIndex = null;
    let topList = false;


    const shareCredentialHandler = async () => {
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
        await shareCredentialsWithGroups({
            groupData: payload,
        });
    };

    // function handleCheck(e: any, group: Group) {
    //     if (e.target.checked) {
    //         selectedGroups.set(group.groupId, { ...group, accessType: "read" });
    //     } else {
    //         selectedGroups.delete(group.groupId);
    //     }
    // }

    function handleClick(index: number, isSelectedList: boolean){
        showOptions = !showOptions
        selectionIndex = index
        topList = isSelectedList
    }


    function handleItemRemove(index: number){
        console.log('selected grps inside handle item remove',selectedGroups )
        // const removedUser = selectedGroups.splice(index, 1)
        // selectedGroups = [...selectedGroups]
        // const [{ accessType, ...userWithoutAccessType }] = removedUser;
        // groups = [...groups, { ...userWithoutAccessType}]
    }


    // const handleRoleChange = (e: any, group: Group) => {
    //     if (selectedGroups.has(group.groupId)) {
    //         const updatedGroup = {
    //             ...selectedGroups.get(group.groupId),
    //             accessType: e.target.value,
    //         };
    //         selectedGroups.set(group.groupId, updatedGroup);
    //     }
    // };

    function handleRoleChange(e: any, index: number, type: string){
         const item = e.detail.item;
         const option = e.detail.permission;
        showOptions = !showOptions
        selectionIndex = null
       if(type === "selectedGroups"){
            selectedGroups.splice(index, 1)
            selectedGroups = [...selectedGroups, { ...item, accessType: option }];
        } else {
            selectedGroups = [...selectedGroups, { ...item, accessType: option }];
            console.log('Handle role change', groups, selectedGroups)
            groups = groups.filter((u) => u.groupId !== item.groupId);
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
        {#each selectedGroups as group, index}
            <ListItem
            item={group}
            isGroup={true}
            isSelected={index === selectionIndex && topList}
            isTopList={true}
            on:click =  {()=>handleClick(index, true)}
            on:remove = {() => handleItemRemove(index)}
            {setbackground}
            {showOptions}
            on:select={(e)=> handleRoleChange(e,index, 'selectedGroups')}
             />
        {/each}
        {#each groups as group, index}
        <ListItem
            item={group}
            isGroup={true}
            isSelected={index === selectionIndex && !topList}
            isTopList={false}
            on:click =  {()=>handleClick(index,false)}
            {setbackground}
            {showOptions}
            on:select={(e)=> handleRoleChange(e,index, 'groups')}
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
