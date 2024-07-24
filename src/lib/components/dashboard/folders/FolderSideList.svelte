<script lang="ts">
	import { slide } from "svelte/transition";

	import FolderEditor from "./FolderEditor.svelte";

	import {
		showAddFolderDrawer,
		folderStore,
		selectedFolder,
		buttonRef,
		showMoreOptions,
		modalManager,
		credentialStore,
		envStore,
		selectedEnv,
		selectedSection,
		showFolderRenameDrawer,
	} from "../store";

	import { Folder, SelectedSection } from "../dtos";
	import { Menu, FolderIcon, Add, RightArrow } from "../icons";
	import { onMount } from "svelte";
	import { setFolderStore, setEnvStore } from "../../../store/storeHelper";
	import FolderAdd from "../../basic/icons/folderAdd.svelte";
	import EnvironmentAdd from "../../basic/icons/environmentAdd.svelte";
	import ExistingEnvironment from "../../basic/icons/existingEnvironment.svelte";
	import { Env } from "../../../dtos/folder.dto";
	let iconColor = "#6E7681";
	let hoveringFolderId: string | null = null;
	let hoveringEnvId: string | null = null;

	const selectFolder = async (folder: Folder, section: SelectedSection) => {
		try {
			selectedFolder.set(folder);
			selectedEnv.set(null);
			selectedSection.set(section);
			credentialStore.set([]);
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

	const selectEnv = (env: Env) => {
		selectedEnv.set(env);
		selectedFolder.set(null);
		selectedSection.set("Environments");
		credentialStore.set([]);
	};

	const selectSection = (section: SelectedSection) => {
		selectedSection.set(section);
		selectedFolder.set(null);
		selectedEnv.set(null);
		credentialStore.set([]);
	};

	onMount(async () => {
		await setFolderStore();
		await setEnvStore();
		if (!$selectedFolder) {
			selectedSection.set("SharedFolders");
		}
		// selectSection("SharedFolders");
	});
</script>

<div class="h-full w-full flex flex-col justify-start items-center">
	<button
		class="w-[90%] bg-osvauld-frameblack border border-osvauld-iconblack text-osvauld-sheffieldgrey hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack whitespace-nowrap rounded-lg py-1.5 px-2 mb-4 flex justify-center items-center"
		on:mouseenter="{() => (iconColor = '#000')}"
		on:mouseleave="{() => (iconColor = '#6E7681')}"
		on:click="{openModal}"
	>
		<span class="mr-1 text-base font-normal">Create new folder</span>
		<Add color="{iconColor}" />
	</button>
	{#if $showAddFolderDrawer}
		<button
			class="fixed inset-0 flex items-center justify-center z-50 backdrop-filter backdrop-blur-[2px]"
			on:click="{closeModal}"
		>
			<button class="p-6 rounded" on:click|stopPropagation>
				<FolderEditor />
			</button>
		</button>
	{/if}
	{#if $showFolderRenameDrawer && $selectedFolder}
		<button
			class="fixed inset-0 flex items-center justify-center z-50 backdrop-filter backdrop-blur-[2px]"
			on:click="{closeModal}"
		>
			<button class="p-6 rounded" on:click|stopPropagation>
				<FolderEditor
					name="{$selectedFolder.name}"
					description="{$selectedFolder.description}"
					addFolder="{false}"
				/>
			</button>
		</button>
	{/if}
	<div class="border-b border-osvauld-iconblack my-1 w-[90%]"></div>
	<ul
		class="overflow-y-scroll w-[90%] overflow-x-hidden scrollbar-thin min-h-[8rem] -pl-3"
	>
		{#each $folderStore as folder, index}
			{#if folder.type === "shared"}
				<li
					class="{$selectedFolder?.id == folder.id
						? 'bg-osvauld-fieldActive rounded-lg text-osvauld-sideListTextActive'
						: 'hover:bg-osvauld-fieldActive text-osvauld-fieldText'} rounded-md my-0.5 pl-3 pr-3 mr-1 flex items-center"
					on:mouseenter="{() => (hoveringFolderId = folder.id)}"
					on:mouseleave="{() => (hoveringFolderId = null)}"
				>
					<button
						on:click="{() => selectFolder(folder, 'SharedFolders')}"
						class="w-full p-2 text-lg rounded-2xl flex items-center cursor-pointer"
					>
						<FolderIcon
							color="{$selectedFolder?.id == folder.id ||
							hoveringFolderId === folder.id
								? '#F2F2F0'
								: '#85889C'}"
						/>
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
									: 'invisible'}">{$credentialStore.length}</span
							></span
						>
						<div
							class="relative z-100 ml-auto flex justify-center items-center {$selectedFolder?.id ==
								folder.id || hoveringFolderId === folder.id
								? 'visible'
								: 'invisible'}"
						>
							{#if folder.accessType === "manager"}
								<button
									class="p-2"
									on:click="{(e) => {
										openFolderMenu(e, folder.id, folder.name, folder.type);
									}}"
								>
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
	<button
		on:click="{() =>
			selectSection(
				$selectedSection === 'PrivateFolders'
					? 'SharedFolders'
					: 'PrivateFolders',
			)}"
		class=" w-[90%] py-2 flex justify-between items-center px-2 rounded-md {$selectedSection ===
		'PrivateFolders'
			? 'bg-osvauld-sideListHighlight text-osvauld-sideListTextActive'
			: 'text-osvauld-fieldText'}"
		>Private Folders <span class="flex"
			><FolderAdd
				color="{$selectedSection === 'PrivateFolders' ? '#F2F2F0' : '#85889C'}"
			/>
			<span
				class="{$selectedSection === 'PrivateFolders'
					? 'rotate-90 transition-all'
					: 'rotate-0'}"
			>
				<RightArrow
					color="{$selectedSection === 'PrivateFolders'
						? '#F2F2F0'
						: '#85889C'}"
				/>
			</span>
		</span>
	</button>

	{#if $selectedSection === "PrivateFolders"}
		<div class="w-[90%]" transition:slide="{{ delay: 0, duration: 100 }}">
			<ul
				class="overflow-y-scroll w-full overflow-x-hidden scrollbar-thin min-h-[8rem] my-2"
			>
				{#each $folderStore as folder}
					{#if folder.type === "private"}
						<li
							class="{$selectedFolder?.id === folder.id
								? 'bg-osvauld-fieldActive rounded-lg text-osvauld-sideListTextActive'
								: 'hover:bg-osvauld-fieldActive text-osvauld-fieldText'} rounded-md my-0.5 pl-3 pr-3 mr-1 flex items-center"
							on:mouseenter="{() => (hoveringFolderId = folder.id)}"
							on:mouseleave="{() => (hoveringFolderId = null)}"
						>
							<button
								on:click="{() => selectFolder(folder, 'PrivateFolders')}"
								class="w-full p-2 text-lg rounded-2xl flex items-center cursor-pointer"
							>
								<FolderIcon
									color="{$selectedFolder?.id == folder.id ||
									hoveringFolderId === folder.id
										? '#F2F2F0'
										: '#85889C'}"
								/>
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
											: 'invisible'}">{$credentialStore.length}</span
									>
								</span>
								<div
									class="relative z-100 ml-auto flex justify-center items-center {$selectedFolder?.id ==
										folder.id || hoveringFolderId === folder.id
										? 'visible'
										: 'invisible'}"
								>
									<button
										class="p-2"
										on:click="{(e) => {
											openFolderMenu(e, folder.id, folder.name, folder.type);
										}}"
									>
										<Menu />
									</button>
								</div>
							</button>
						</li>
					{/if}
				{/each}
			</ul>
		</div>
	{/if}

	<div class="border-b border-osvauld-iconblack my-1 w-[90%] mt-0"></div>
	<button
		on:click="{() =>
			selectSection(
				$selectedSection === 'Environments' ? 'SharedFolders' : 'Environments',
			)}"
		class="w-[90%] py-2 flex justify-between items-center my-1.5 pl-2 px-2 rounded-md {$selectedSection ===
		'Environments'
			? 'bg-osvauld-sideListHighlight text-osvauld-sideListTextActive'
			: 'text-osvauld-fieldText'}"
		>Environments <span class="flex"
			><EnvironmentAdd
				color="{$selectedSection === 'Environments' ? '#F2F2F0' : '#85889C'}"
			/>
			<span
				class="{$selectedSection === 'Environments'
					? 'rotate-90 transition-all'
					: 'rotate-0'}"
			>
				<RightArrow
					color="{$selectedSection === 'Environments' ? '#F2F2F0' : '#85889C'}"
				/>
			</span>
		</span>
	</button>
	{#if $selectedSection === "Environments"}
		<div class="w-[90%]" transition:slide="{{ delay: 0, duration: 100 }}">
			<ul
				class="overflow-y-scroll w-full overflow-x-hidden scrollbar-thin min-h-[4rem] max-h-[8.5rem] pl-0"
			>
				{#each $envStore as env}
					<li
						class="{$selectedEnv?.id == env.id
							? 'bg-osvauld-fieldActive rounded-lg text-osvauld-sideListTextActive'
							: 'hover:bg-osvauld-fieldActive text-osvauld-fieldText'} 
          rounded-md my-1 pl-3 pr-3 mr-1 flex items-center transition-colors duration-0 ease-in"
						on:mouseenter="{() => (hoveringEnvId = env.id)}"
						on:mouseleave="{() => (hoveringEnvId = null)}"
					>
						<button
							on:click="{() => {
								selectEnv(env);
							}}"
							class="w-full p-2 text-lg rounded-2xl flex items-center"
						>
							<ExistingEnvironment
								color="{$selectedEnv?.id == env.id || hoveringEnvId === env.id
									? '#F2F2F0'
									: '#85889C'}"
							/>
							<span
								class="ml-2 text-base font-light overflow-hidden text-ellipsis whitespace-nowrap text-left inline-block w-[8rem] {$selectedEnv?.id ==
									env.id || hoveringEnvId === env.id
									? 'text-osvauld-sideListTextActive'
									: 'text-osvauld-fieldText'}"
								>{env.name}
							</span>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
