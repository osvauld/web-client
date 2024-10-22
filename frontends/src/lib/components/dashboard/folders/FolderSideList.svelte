<script lang="ts">
	import FolderEditor from "./FolderEditor.svelte";

	import {
		showAddFolderDrawer,
		folderStore,
		selectedFolder,
		buttonRef,
		showMoreOptions,
		modalManager,
		credentialStore,
		showFolderRenameDrawer,
	} from "../store";

	import { Folder } from "../dtos";
	import { Menu, FolderIcon, Add, RightArrow } from "../icons";
	import { onMount } from "svelte";
	import {
		setFolderStore,
		setCredentialStore,
	} from "../../../store/storeHelper";
	let iconColor = "#6E7681";
	let hoveringFolderId: string | null = null;

	const selectFolder = async (folder: Folder) => {
		try {
			selectedFolder.set(folder);
			await setCredentialStore();
		} catch (error) {
			console.error(error);
		}
	};

	const openModal = () => {
		showAddFolderDrawer.set(true);
	};

	const closeModal = () => {
		showAddFolderDrawer.set(false);
	};

	const openFolderMenu = (
		e: any,
		folderId: string,
		folderName: string,
		type: string,
	) => {
		buttonRef.set(e.currentTarget);
		modalManager.set({
			id: folderId,
			name: folderName,
			type: "Folder",
			private: type === "private",
		});
		showMoreOptions.set(true);
	};

	onMount(async () => {
		await setFolderStore();
	});
</script>

<div class="h-full w-full flex flex-col justify-start items-center">
	<button
		class="w-[90%] bg-osvauld-frameblack border border-osvauld-iconblack text-osvauld-sheffieldgrey hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack whitespace-nowrap rounded-lg py-1.5 px-2 mb-4 flex justify-center items-center"
		on:mouseenter="{() => (iconColor = '#000')}"
		on:mouseleave="{() => (iconColor = '#6E7681')}"
		on:click="{openModal}">
		<span class="mr-1 text-base font-normal">Create new folder</span>
		<Add color="{iconColor}" />
	</button>
	{#if $showAddFolderDrawer}
		<button
			class="fixed inset-0 flex items-center justify-center z-50 backdrop-filter backdrop-blur-[2px]"
			on:click="{closeModal}">
			<button class="p-6 rounded" on:click|stopPropagation>
				<FolderEditor />
			</button>
		</button>
	{/if}
	{#if $showFolderRenameDrawer && $selectedFolder}
		<button
			class="fixed inset-0 flex items-center justify-center z-50 backdrop-filter backdrop-blur-[2px]"
			on:click="{closeModal}">
			<button class="p-6 rounded" on:click|stopPropagation>
				<FolderEditor
					name="{$selectedFolder.name}"
					description="{$selectedFolder.description}"
					addFolder="{false}" />
			</button>
		</button>
	{/if}
	<div class="border-b border-osvauld-iconblack my-1 w-[90%]"></div>
	<ul
		class="overflow-y-scroll w-[90%] overflow-x-hidden scrollbar-thin min-h-[8rem] -pl-3">
		{#each $folderStore as folder}
			{#if folder.shared}
				<li
					class="{$selectedFolder?.id == folder.id
						? 'bg-osvauld-fieldActive rounded-lg text-osvauld-sideListTextActive'
						: 'hover:bg-osvauld-fieldActive text-osvauld-fieldText'} rounded-md my-0.5 pl-3 pr-3 mr-1 flex items-center"
					on:mouseenter="{() => (hoveringFolderId = folder.id)}"
					on:mouseleave="{() => (hoveringFolderId = null)}">
					<button
						on:click="{() => selectFolder(folder)}"
						class="w-full p-2 text-lg rounded-2xl flex items-center cursor-pointer">
						<FolderIcon
							color="{$selectedFolder?.id == folder.id ||
							hoveringFolderId === folder.id
								? '#F2F2F0'
								: '#85889C'}" />
						<span
							class="ml-2 text-base font-light overflow-hidden text-ellipsis whitespace-nowrap text-left relative inline-block min-w-[2rem] max-w-[9rem] pr-6 {$selectedFolder?.id ==
								folder.id || hoveringFolderId === folder.id
								? 'text-osvauld-sideListTextActive'
								: 'text-osvauld-fieldText'}"
							>{folder.name}
							<span
								class="ml-2 text-osvauld-fieldText font-light absolute right-0 {$selectedFolder?.id ===
								folder.id
									? 'visible delay-200'
									: 'invisible'}">{$credentialStore?.length}</span
							></span>
						<div
							class="relative z-100 ml-auto flex justify-center items-center {$selectedFolder?.id ==
								folder.id || hoveringFolderId === folder.id
								? 'visible'
								: 'invisible'}">
							{#if folder.accessType === "manager"}
								<button
									class="p-2"
									on:click="{(e) => {
										openFolderMenu(e, folder.id, folder.name, folder.type);
									}}">
									<Menu />
								</button>
							{/if}
						</div>
					</button>
				</li>
			{/if}
		{/each}
	</ul>
	<div class="border-b border-osvauld-iconblack my-1 w-[90%] mt-auto"></div>
</div>
