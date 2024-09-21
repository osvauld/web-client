<script lang="ts">
	import {
		addCredential,
		fetchAllFolders,
		fetchFolderUsersForDataSync,
	} from "../dashboard/apis";
	import { sendMessage } from "../dashboard/helper";

	import { Eye, ClosedEye, FolderIcon } from "./icons";
	import Locked from "../basic/icons/locked.svelte";
	import { Folder } from "../dashboard/dtos";
	export let username = "";
	export let password = "";
	export let domain = "";
	export let windowId: string | number;
	export let currentUrl: string;
	let visibility = false;
	let name = "";
	let description = "";
	let showFolderList = false;
	let folderData: Folder[] = [];
	let selectedFolderId: string | null = null;
	let hoveringIndex: number | null = null;
	$: type = visibility ? "text" : "password";

	let addCredentialPayload = {
		name: name,
		folderId: "",
		description: description,
		credentialType: "Login",
		userFields: [],
		domain,
	};
	// Function to handle form submission
	const handleSubmit = async () => {
		const responseJson = await fetchAllFolders();
		folderData = responseJson.data.sort((a: Folder, b: Folder) =>
			a.name.localeCompare(b.name),
		);
		showFolderList = true;
	};

	const handleFolderSelect = async (folderId: string) => {
		selectedFolderId = folderId;
	};

	const handleSave = async () => {
		if (selectedFolderId === null) {
			throw new Error("Please select a folder to save the credential");
		}
		const response = await fetchFolderUsersForDataSync(selectedFolderId);
		const usersToShare = response.data;
		const fieldPayload = [
			{ fieldName: "Username", fieldValue: username, fieldType: "meta" },
			{
				fieldName: "Password",
				fieldValue: password,
				fieldType: "sensitive",
			},
			{
				fieldName: "Domain",
				fieldValue: domain,
				fieldType: "additional",
			},
			{ fieldName: "URL", fieldValue: currentUrl, fieldType: "meta" },
		];
		addCredentialPayload.folderId = selectedFolderId;
		const userFields = await sendMessage("addCredential", {
			users: usersToShare,
			addCredentialFields: fieldPayload,
		});
		addCredentialPayload.name = name;
		addCredentialPayload.description = description;
		addCredentialPayload.userFields = userFields;
		await addCredential(addCredentialPayload);
		showFolderList = false;
	};
</script>

{#if showFolderList}
	<div class="text-osvauld-textActive text-base max-w-full pl-4">
		Select Folder to add this credential
	</div>
	<ul
		class="flex flex-col p-4 max-w-sm mx-auto space-y-2 text-osvauld-textActive bg-osvauld-cardshade max-h-[26rem] rounded-lg overflow-y-scroll w-full overflow-x-hidden scrollbar-thin">
		{#each folderData as folder, index}
			{#if folder.accessType === "manager"}
				<li
					class="{selectedFolderId == folder.id
						? 'bg-osvauld-fieldActive rounded-lg text-osvauld-sideListTextActive'
						: 'hover:bg-osvauld-fieldActive text-osvauld-fieldText'} rounded-md my-0.5 pl-3 pr-3 mr-1 flex items-center transition-colors duration-100"
					on:mouseenter="{() => (hoveringIndex = index)}"
					on:mouseleave="{() => (hoveringIndex = null)}">
					<button
						on:click="{() => handleFolderSelect(folder.id)}"
						class="w-full py-1 px-2 text-lg rounded-2xl flex items-center cursor-pointer">
						<FolderIcon
							color="{selectedFolderId == folder.id || hoveringIndex === index
								? '#F2F2F0'
								: '#85889C'}" />
						<span
							class="max-w-[75%] ml-2 text-base font-light overflow-hidden text-ellipsis whitespace-nowrap {selectedFolderId ==
								folder.id || hoveringIndex === index
								? 'text-osvauld-sideListTextActive'
								: 'text-osvauld-fieldText'}"
							>{folder.name}
						</span>
						{#if folder.type === "private"}
							<span class="ml-auto">
								<Locked />
							</span>
						{/if}
					</button>
				</li>
			{/if}
		{/each}
	</ul>
	<button
		on:click="{handleSave}"
		class="w-full mt-2 px-4 py-2 font-normal rounded-md active::scale-95 {selectedFolderId ===
		null
			? 'bg-osvauld-cardshade text-osvauld-textActive border border-osvauld-iconblack'
			: 'bg-osvauld-carolinablue text-osvauld-frameblack'}">
		Save
	</button>
{:else}
	<div class="text-osvauld-textActive text-base max-w-full pl-4">
		{windowId === "manual"
			? "Enter Details of your credential"
			: "Would you like to add this credential to osvauld?"}
	</div>
	<form
		on:submit|preventDefault="{handleSubmit}"
		class="flex flex-col p-4 max-w-sm mx-auto text-osvauld-textActive bg-osvauld-cardshade rounded-lg h-[90%] gap-2 relative">
		<div>
			<input
				id="name"
				type="text"
				required
				placeholder="Enter credential name"
				bind:value="{name}"
				class="mt-1 block w-full px-3 py-1 rounded-md shadow-sm sm:text-sm bg-osvauld-cardshade border-osvauld-iconblack focus:border-osvauld-iconblack focus:ring-0"
				autocomplete="off" />
		</div>
		<div>
			<label
				for="username"
				class="block text-sm font-medium text-osvauld-textActive"
				>Username</label>
			<input
				id="username"
				type="text"
				bind:value="{username}"
				autocomplete="off"
				class="mt-1 block w-full px-3 py-1 shadow-sm sm:text-sm text-osvauld-fieldTextActive bg-osvauld-fieldActive rounded-md border-0 focus:border-osvauld-iconblack focus:ring-0" />
		</div>
		<div>
			<label
				for="password"
				class="block text-sm font-medium text-osvauld-textActive"
				>Password</label>
			<div class="flex bg-osvauld-fieldActive">
				<input
					id="password"
					{...{ type }}
					bind:value="{password}"
					autocomplete="off"
					class="mt-1 block w-[90%] px-3 py-1 shadow-sm sm:text-sm text-osvauld-fieldTextActive bg-osvauld-fieldActive rounded-md border-0 focus:border-osvauld-iconblack focus:ring-0" />
				<button
					class="w-[10%] flex justify-center items-center"
					type="button"
					on:click="{() => (visibility = !visibility)}">
					{#if visibility}
						<ClosedEye />
					{:else}
						<Eye />
					{/if}
				</button>
			</div>
		</div>
		<div>
			<label
				for="domain"
				class="block text-sm font-medium text-osvauld-textActive">Domain</label>
			<input
				id="domain"
				type="text"
				bind:value="{domain}"
				autocomplete="off"
				class="mt-1 block w-full px-3 py-1 shadow-sm sm:text-sm text-osvauld-fieldTextActive bg-osvauld-fieldActive rounded-md border-0 focus:border-osvauld-iconblack focus:ring-0" />
		</div>

		<div>
			<label
				for="description"
				class="block text-sm font-medium text-osvauld-textActive"
				>Description</label>
			<textarea
				id="description"
				bind:value="{description}"
				rows="3"
				class="mt-1 block w-full px-3 py-1 shadow-sm sm:text-sm text-osvauld-fieldTextActive bg-osvauld-cardshade rounded-md border border-osvauld-iconblack focus:border-osvauld-iconblack focus:ring-0"
			></textarea>
		</div>
		<button
			type="submit"
			class="px-4 py-2 bg-osvauld-carolinablue text-osvauld-frameblack font-normal rounded-md active::scale-95 mt-auto mb-12">
			Next
		</button>
	</form>
	<!-- <button
		class="text-osvauld-fadedCancel rounded-md border border-osvauld-iconblack font-normal text-sm absolute left-2 bottom-2 px-2 py-1 {windowId ===
		'manual'
			? 'visible'
			: 'invisible'}"
		on:click|preventDefault|stopPropagation="{closeEventDispatcher}"
		>Cancel</button> -->
{/if}
