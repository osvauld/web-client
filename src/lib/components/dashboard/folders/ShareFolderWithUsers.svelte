<script lang="ts">
	import { shareFolderWithUsers } from "../apis";
	import {
		User,
		UserWithAccessType,
		ShareFolderWithUsersPayload,
		CredentialFields,
	} from "../dtos";
	import { createEventDispatcher, onMount } from "svelte";
	import { selectedFolder, toastStore } from "../store";
	import { sendMessage, setbackground } from "../helper";
	import { Lens } from "../icons";
	import ListItem from "../components/ListItem.svelte";
	import { on } from "events";

	const dispatch = createEventDispatcher();
	export let users: User[];
	export let credentialsFields: CredentialFields[];
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

	export const shareFolderHandler = async () => {
		if ($selectedFolder === null) {
			throw new Error("Folder not selected");
		}
		const userData = await sendMessage("createShareCredPayload", {
			creds: credentialsFields,
			users: selectedUsers,
		});

		const shareFolderPayload: ShareFolderWithUsersPayload = {
			folderId: $selectedFolder.id,
			// @ts-ignore
			userData,
		};
		const shareStatus = await shareFolderWithUsers(shareFolderPayload);
		toastStore.set({
			type: shareStatus.success,
			message: "Successfully shared",
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

<div class="p-2 w-full max-h-full overflow-hidden">
	<div class="bg-osvauld-frameblack flex justify-center items-center">
		<div
			class="h-[1.875rem] w-full px-2 mx-auto flex justify-start items-center border border-osvauld-iconblack rounded-lg cursor-pointer"
		>
			<Lens />
			<input
				type="text"
				bind:value="{searchInput}"
				class="h-[1.75rem] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
				placeholder=""
			/>
		</div>
	</div>

	<div
		class="overflow-y-scroll scrollbar-thin bg-osvauld-frameblack w-full {selectedUsers.length !==
		0
			? 'h-[8rem]'
			: 'h-[15rem]'} flex flex-col justify-start items-center"
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
		class="my-2 w-full border border-osvauld-iconblack rounded-lg h-[8rem] mb-2"
	>
		<div
			class="overflow-y-scroll h-[90%] scrollbar-thin rounded-lg w-full px-2 mt-1"
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
				<div class="border-b border-osvauld-iconblack w-full"></div>
			{/each}
		</div>
	</div>
{/if}
