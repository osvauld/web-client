<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Unsubscriber } from "svelte/store";

	import {
		selectedGroup,
		showAddUserToGroupDrawer,
		allUsersSelected,
	} from "../store";

	import AddUserToGroup from "./AddUserToGroup.svelte";

	import { User } from "../dtos";
	import { groupUsers, groupStore } from "../store";
	import { fetchGroupUsers, fetchSignedUpUsers } from "../apis";
	import AllUsersList from "./AllUsersList.svelte";
	import OtherGroupsList from "./OtherGroupsList.svelte";
	import Placeholder from "../components/Placeholder.svelte";

	let unsubscribe: Unsubscriber;
	let groupName = "";
	let allUsers: User[] = [];

	let adminStatus = false;
	onMount(() => {
		const accountDetails = localStorage.getItem("user");
		let accountRole = JSON.parse(accountDetails).type;
		if (accountRole === "admin") {
			adminStatus = true;
		}
		if (adminStatus) {
			fetchSignedUpUsers().then((usersResponse) => {
				allUsers = usersResponse.data;
			});
		}
	});

	unsubscribe = selectedGroup.subscribe((value) => {
		if (value) {
			groupName = value.name;
			fetchGroupUsers(value.groupId).then((usersResponse) => {
				groupUsers.set(usersResponse.data);
			});
		}
	});
	onDestroy(() => {
		unsubscribe();
		groupUsers.set([]);
	});
</script>

<div class="z-50">
	{#if $showAddUserToGroupDrawer}
		<button
			class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
			on:click="{() => {}}"
		>
			<button class="p-6 rounded bg-transparent" on:click|stopPropagation>
				<AddUserToGroup />
			</button>
		</button>
	{/if}
</div>

<div class="min-w-screen h-[48rem] flex overflow-">
	<div class="w-full">
		{#if adminStatus && $allUsersSelected}
			<AllUsersList />
		{:else if $selectedGroup}
			<OtherGroupsList {groupName} />
		{:else}
			<div class="mt-20">
				<Placeholder />
			</div>
		{/if}
	</div>
</div>
