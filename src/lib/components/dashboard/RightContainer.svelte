<script lang="ts">
	import CredentialList from "./credentials/CredentialList.svelte";
	import GroupList from "./groups/GroupList.svelte";
	import SearchModal from "./SearchModal.svelte";
	import Environments from "./credentials/Environments.svelte";
	import { searchObjects } from "./helper";
	import { getSearchFields, fetchAllUserUrls } from "./apis";
	import { Profile, Lens, DownArrow } from "./icons";
	import { sendMessage, getUserDetails } from "./helper";
	import { onMount } from "svelte";
	import {
		selectedFolder,
		selectedPage,
		credentialStore,
		searchedCredential,
		folderStore,
		selectedSection,
	} from "./store";

	import ProfileModal from "./components/ProfileModal.svelte";
	import { SearchedCredential } from "../../dtos/credential.dto";
	let searchResults: SearchedCredential[] = [];
	let searchData: SearchedCredential[] = [];
	let showModal = false;
	let isProfileClicked = false;
	let clickedOutside = false;
	let top = 0;
	let left = 0;
	let query = "";
	let username = "";

	const getSearchData = async () => {
		showModal = true;
		const searchFieldSResponse = await getSearchFields();
		searchData = searchFieldSResponse.data;

		const urlJson = await fetchAllUserUrls();
		const urls = urlJson.data;
		const decryptedData = await sendMessage("getDecryptedUrls", urls);

		const mergedArray = searchData.map((item) => {
			const replacement = decryptedData.find(
				(decryptedItem) => decryptedItem.credentialId === item.credentialId,
			);
			if (replacement) {
				return { ...item, domain: replacement.value };
			}
			return item;
		});
		searchData = mergedArray;
		searchResults = query.length !== 0 ? searchObjects(query, searchData) : [];
	};

	const handleInputChange = (e: any) => {
		const query = e.type === "input" ? e.target.value : e.detail;
		searchResults = query.length >= 1 ? searchObjects(query, searchData) : [];
	};

	const closeModal = () => {
		showModal = false;
		query = "";
		searchResults = [];
	};
	const handleSearchClick = (e: any) => {
		searchedCredential.set(e.detail);
		selectedPage.set("Folders");
		if (e.detail.folderType === "shared") {
			selectedSection.set("SharedFolders");
		} else if (e.detail.folderType === "private") {
			selectedSection.set("PrivateFolders");
		}
		for (const folder of $folderStore) {
			if (folder.id === e.detail.folderId) {
				selectedFolder.set(folder);
				break;
			}
		}
		closeModal();
	};

	selectedPage.subscribe(() => {
		credentialStore.set([]);
	});

	function handleKeyDown(event) {
		if (event.key === "Enter") {
			getSearchData();
		}
	}

	function profileSelectionManager(e: any) {
		if (!clickedOutside) {
			const rect = e.currentTarget.getBoundingClientRect();
			top = rect.top + window.scrollY + rect.height;
			left = rect.left + window.scrollX;
			isProfileClicked = !isProfileClicked;
		}
	}

	function autofocus(node) {
		node.focus();
	}
	const handleProfileClose = () => {
		isProfileClicked = false;
		clickedOutside = true;
		setTimeout(() => {
			clickedOutside = false;
		}, 100);
	};

	onMount(async () => {
		const account = await getUserDetails();
		username = account.username;
	});
</script>

<div class="flex flex-col h-auto">
	<div
		class="h-[6rem] pr-4 flex justify-between items-center border-b border-osvauld-iconblack"
	>
		<div
			class="h-[2.2rem] w-[31.25rem] px-2 mx-auto flex justify-start items-center border border-osvauld-iconblack focus-within:border-osvauld-activeBorder rounded-lg cursor-pointer"
		>
			<Lens />
			<input
				type="text"
				class="h-[2rem] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
				placeholder="Search.."
				use:autofocus
				on:click="{getSearchData}"
				on:input="{handleInputChange}"
				bind:value="{query}"
				on:keyup="{handleKeyDown}"
			/>
		</div>
		<button
			class="profile-button min-w-[8rem] max-w-[12rem] bg-osvauld-cardshade rounded-md flex justify-around text-osvauld-fieldText items-center cursor-pointer py-1"
			on:click|stopPropagation="{profileSelectionManager}"
		>
			<div class="flex justify-center items-center">
				<Profile color="{isProfileClicked ? '#F2F2F0' : '#85889C'}" /><span
					class="font-inter text-base overflow-hidden max-w-[6rem] text-ellipsis whitespace-nowrap {isProfileClicked
						? 'text-osvauld-sideListTextActive'
						: 'text-osvauld-fieldText'} ">{username}</span
				>
			</div>
			<span
				class="transition-transform duration-100 ease-linear {isProfileClicked
					? 'rotate-180'
					: 'rotate-0'}"
			>
				<DownArrow type="{isProfileClicked ? 'profileActive' : 'profile'}" />
			</span>
		</button>
	</div>

	{#if isProfileClicked}
		<ProfileModal {top} {left} {username} on:close="{handleProfileClose}" />
	{/if}

	{#if showModal}
		<SearchModal
			{searchResults}
			{query}
			on:close="{closeModal}"
			on:select="{handleSearchClick}"
			on:change="{handleInputChange}"
			on:enter="{handleKeyDown}"
		/>
	{/if}
	<div class="h-[90vh] bg-osvauld-frameblack mr-4 overflow-hidden">
		{#if $selectedPage === "Folders" && ($selectedSection === "SharedFolders" || $selectedSection === "PrivateFolders")}
			<CredentialList />
		{:else if $selectedPage === "Folders" && $selectedSection === "Environments"}
			<Environments />
		{:else if $selectedPage === "Groups"}
			<GroupList />
		{/if}
	</div>
</div>
