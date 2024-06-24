<script lang="ts">
	import {
		User,
		UserWithAccessType,
		CredentialFields,
		ShareCredentialsWithUsersPayload,
	} from "../dtos";
	import { createEventDispatcher, onMount } from "svelte";
	import { shareCredentialsWithUsers } from "../apis";
	import { sendMessage, setbackground } from "../helper";

	import { Lens } from "../icons";
	import ListItem from "../components/ListItem.svelte";
	import { toastStore } from "../store";
	const dispatch = createEventDispatcher();
	export let users: User[];
	export let credentialsFields: CredentialFields[] = [];
	let selectedUsers: UserWithAccessType[] = [];
	let showOptions = false;
	let selectionIndex: number | null = null;
	let topList = false;
	let searchInput = "";

	$: selectedUsers.length === 0 && dispatch("enable", false);

	$: filteredUsers = searchInput
		? users.filter((user) =>
				user.name.toLowerCase().includes(searchInput.toLowerCase()),
			)
		: users;

	export const shareCredentialHandler = async () => {
		const userData = await sendMessage("createShareCredPayload", {
			creds: credentialsFields,
			users: selectedUsers,
		});

		const payload: ShareCredentialsWithUsersPayload = { userData };
		const shareStatus = await shareCredentialsWithUsers(payload);
		toastStore.set({
			type: true,
			message: shareStatus.message,
			show: true,
		});
		dispatch("cancel", true);
	};

	function handleClick(index: number, isSelectedList: boolean) {
		showOptions = !showOptions;
		selectionIndex = index;
		topList = isSelectedList;
	}

	function handleItemRemove(index: number) {
		const removedUser = selectedUsers.splice(index, 1);
		selectedUsers = [...selectedUsers];
		const [{ accessType, ...userWithoutAccessType }] = removedUser;
		users = [...users, { ...userWithoutAccessType }];
	}

	function handleRoleChange(e: any, index: number, type: string) {
		const user = e.detail.item;
		const option = e.detail.permission;
		showOptions = !showOptions;
		selectionIndex = null;
		if (type === "selectedUsers") {
			selectedUsers.splice(index, 1);
			selectedUsers = [...selectedUsers, { ...user, accessType: option }];
		} else {
			selectedUsers = [...selectedUsers, { ...user, accessType: option }];
			users = users.filter((u) => u.id !== user.id);
		}
		selectedUsers.length !== 0 && dispatch("enable", true);
	}

	onMount(() => {
		//Below will disable save changes button when group/user button switched
		dispatch("enable", false);
	});
</script>

<div class="p-2 rounded-lg pl-2 w-full">
	<div
		class="h-[1.875rem] w-full px-2 mx-auto flex justify-start items-center cursor-pointer border rounded-lg border-osvauld-iconblack"
	>
		<Lens />
		<input
			type="text"
			bind:value="{searchInput}"
			class="h-[1.60rem] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
			placeholder=""
		/>
	</div>

	<div
		class="overflow-y-scroll scrollbar-thin h-[20rem] bg-osvauld-frameblack w-full"
	>
		{#each filteredUsers as user, index}
			<ListItem
				item="{user}"
				isSelected="{index === selectionIndex && !topList}"
				on:click="{() => handleClick(index, false)}"
				{setbackground}
				{showOptions}
				reverseModal="{filteredUsers.length > 3 &&
					index > filteredUsers.length - 3}"
				on:select="{(e) => handleRoleChange(e, index, 'users')}"
			/>
		{/each}
	</div>
</div>

{#if selectedUsers.length !== 0}
	<div
		class="overflow-y-scroll overflow-x-hidden scrollbar-thin bg-osvauld-frameblack rounded-lg w-full h-[8rem] p-0.5 border border-osvauld-iconblack mt-auto !text-osvauld-textActive"
	>
		{#each selectedUsers as user, index}
			<ListItem
				item="{user}"
				isSelected="{index === selectionIndex && topList}"
				isBottomList="{true}"
				on:click="{() => handleClick(index, true)}"
				on:remove="{() => handleItemRemove(index)}"
				{setbackground}
				{showOptions}
				reverseModal="{selectedUsers.length > 3 &&
					index > selectedUsers.length - 3}"
				on:select="{(e) => handleRoleChange(e, index, 'selectedUsers')}"
			/>
		{/each}
	</div>
{/if}
