<script lang="ts">
	import { fly } from "svelte/transition";
	import EncryptedField from "./EncryptedField.svelte";
	import PlainField from "./PlainField.svelte";
	import Toggle from "../Toggle.svelte";
	import {
		fetchCredentialUsers,
		fetchCredentialGroups,
		removeGroupFromCredential,
		removeUserFromCredential,
		editGroupPermissionForCredential,
		editUserPermissionForCredential,
		fetchSensitiveFieldsByCredentialId,
	} from "../apis";
	import { showCredentialDetailsDrawer, toastStore } from "../store";
	import { ClosePanel, EditIcon, EyeScan } from "../icons";
	import { onMount } from "svelte";
	import ExistingListItem from "../components/ExistingListItem.svelte";
	import CredentialEditor from "./CredentialEditor.svelte";
	import { sendMessage } from "../helper";

	import { Credential, Fields, Group, UserWithAccessType } from "../dtos";
	import Tick from "../../basic/icons/tick.svelte";
	import FileText from "../../basic/icons/fileText.svelte";
	export let credential: Credential;
	export let sensitiveFields: Fields[];
	let selectedTab = "Groups";
	let accessListSelected = false;
	let accessChangeDetected = false;
	let fieldsForEdit = [];
	let editPermissionTrigger = false;

	let userPermissions: {
		credentialId: string;
		userId: string;
		accessType: string;
	};
	let groupPermissions: {
		credentialId: string;
		groupId: string;
		accessType: string;
	};
	let showEditCredentialModal = false;
	let users: UserWithAccessType[] = [];
	let groups: Group[] = [];

	const toggleSelect = async (e: any) => {
		selectedTab = e.detail;
		if (selectedTab == "Users") {
			const usersResponse = await fetchCredentialUsers(credential.credentialId);
			users = usersResponse.data;
		} else if (selectedTab == "Groups") {
			const groupsResponse = await fetchCredentialGroups(
				credential.credentialId,
			);
			groups = groupsResponse.data;
		}
	};

	const removeGroupFromCredentialHandler = async (group: Group) => {
		await removeGroupFromCredential(credential.credentialId, group.groupId);
		await toggleSelect({ detail: "Groups" });
	};
	const removeUserFromCredentialHandler = async (user: UserWithAccessType) => {
		await removeUserFromCredential(credential.credentialId, user.id);
		await toggleSelect({ detail: "Users" });
	};

	const savePermissions = async () => {
		if (userPermissions && Object.keys(userPermissions).length !== 0) {
			const userPermissionSaveResponse = await editUserPermissionForCredential(
				userPermissions.credentialId,
				userPermissions.userId,
				userPermissions.accessType,
			);
			await toggleSelect({ detail: "Users" });
			accessChangeDetected = false;
			const message = userPermissionSaveResponse.message
				? userPermissionSaveResponse.message
				: "Does not have access";
			toastStore.set({ message, type: true, show: true });
		} else if (Object.keys(groupPermissions).length !== 0) {
			const groupPermissionSaveResponse =
				await editGroupPermissionForCredential(
					groupPermissions.credentialId,
					groupPermissions.groupId,
					groupPermissions.accessType,
				);
			await toggleSelect({ detail: "Groups" });
			accessChangeDetected = false;
			const message = groupPermissionSaveResponse.message
				? groupPermissionSaveResponse.message
				: "Does not have access";
			toastStore.set({ message, type: true, show: true });
		}
		accessChangeDetected = false;
	};

	const permissionChangeHandler = async (e: any, id: string, type: string) => {
		accessChangeDetected = true;

		if (type == "user") {
			userPermissions = {
				credentialId: credential.credentialId,
				userId: id,
				accessType: e.detail,
			};
		} else {
			groupPermissions = {
				credentialId: credential.credentialId,
				groupId: id,
				accessType: e.detail,
			};
		}
	};

	const handleEditCredential = async () => {
		for (let field of sensitiveFields) {
			const response = await sendMessage("decryptField", field.fieldValue);
			let decryptedValue = response.data;
			fieldsForEdit.push({
				fieldName: field.fieldName,
				fieldValue: decryptedValue,
				sensitive: true,
			});
		}
		for (let field of credential.fields) {
			fieldsForEdit.push({
				fieldName: field.fieldName,
				fieldValue: field.fieldValue,
				sensitive: false,
			});
		}
		showEditCredentialModal = true;
	};

	const closeCredentialEditor = async () => {
		showEditCredentialModal = false;
		showCredentialDetailsDrawer.set(false);
	};
	onMount(async () => {
		const groupsResponse = await fetchCredentialGroups(credential.credentialId);
		groups = groupsResponse.data;
		if (sensitiveFields.length === 0) {
			const sensitiveFieldsResponse = await fetchSensitiveFieldsByCredentialId(
				credential.credentialId,
			);
			sensitiveFields = sensitiveFieldsResponse.data;
		}
	});
</script>

{#if showEditCredentialModal}
	<div
		class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
	>
		<button class="p-6 rounded bg-transparent" on:click|stopPropagation>
			<CredentialEditor
				on:close="{closeCredentialEditor}"
				edit="{true}"
				credentialId="{credential.credentialId}"
				name="{credential.name}"
				description="{credential.description}"
				credentialType="{credential.credentialType}"
				credentialFields="{fieldsForEdit}"
			/>
		</button>
	</div>
{/if}
<div
	class="fixed top-0 right-0 z-0 flex justify-end rounded-xl blur-none"
	in:fly
	out:fly
>
	<div
		class="w-[30vw] h-screen shadow-xl translate-x-0 bg-osvauld-frameblack p-6 overflow-y-auto scrollbar-thin"
	>
		<div class="flex pb-4">
			<div
				class="text-3xl font-semibold w-full text-left ml-2 max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
			>
				<span class="">{credential.name}</span>
			</div>
			{#if credential.accessType === "manager" && !accessListSelected}
				<button
					class="p-2 mr-3 rounded-lg {showEditCredentialModal
						? 'bg-osvauld-sensitivebgblue'
						: ''}"
					on:click="{handleEditCredential}"
				>
					<EditIcon />
				</button>
			{/if}
			<button
				class="p-2"
				on:click="{() => showCredentialDetailsDrawer.set(false)}"
				><ClosePanel /></button
			>
		</div>
		<div class="flex justify-start items-center mb-6">
			<button
				on:click="{() => (accessListSelected = false)}"
				class="px-4 py-1.5 flex items-center text-sm font-light rounded-md mr-2 {!accessListSelected &&
					' text-osvauld-carolinablue bg-osvauld-modalFieldActive'}"
			>
				<FileText color="{!accessListSelected ? '#89B4FA' : '#85889C'}" />
				<span
					class="{!accessListSelected
						? 'text-osvauld-carolinablue'
						: 'text-osvauld-fieldText '} ml-2">Details</span
				></button
			>
			<button
				class="rounded-md flex justify-around items-center px-4 py-1.5 text-sm {accessListSelected &&
					'bg-osvauld-modalFieldActive'}
          ''}"
				on:click="{() => (accessListSelected = true)}"
			>
				<EyeScan color="{accessListSelected ? '#89B4FA' : '#85889C'}" />
				<span
					class="ml-2 {accessListSelected
						? 'text-osvauld-carolinablue'
						: 'text-osvauld-fieldText '}">Access List</span
				>
			</button>
		</div>
		<div class="border border-osvauld-iconblack rounded-xl p-3">
			{#if !accessListSelected}
				{#each credential.fields as field}
					<PlainField
						fieldName="{field.fieldName}"
						fieldValue="{field.fieldValue}"
						hoverEffect="{true}"
						bgColor="{null}"
					/>
				{/each}
				{#if sensitiveFields}
					{#each sensitiveFields as field}
						<EncryptedField
							fieldName="{field.fieldName}"
							fieldValue="{field.fieldValue}"
							hoverEffect="{true}"
							bgColor="{null}"
						/>
					{/each}
				{/if}
				{#if credential.description.length !== 0}
					<label
						class="text-osvauld-dusklabel block text-left text-sm font-normal"
						for="credential-description"
					>
						Description
					</label>
					<div
						class="mt-4 w-full h-[4rem] py-1 px-2 overflow-y-scroll bg-osvauld-fieldActive rounded-lg text-left scrollbar-thin resize-none text-base text-osvauld-quarzowhite"
						id="credential-description"
					>
						{credential.description}
					</div>
				{/if}
			{:else}
				<div class="flex justify-between items-center">
					<Toggle on:select="{toggleSelect}" />
					<div class="mr-3">
						{#if accessChangeDetected}
							<button
								class="p-2 mr-1 rounded-lg bg-osvauld-sensitivebgblue"
								on:click="{() => {
									savePermissions();
									editPermissionTrigger = false;
								}}"
							>
								<Tick />
							</button>
						{/if}
						{#if credential.accessType === "manager"}
							<button
								class="p-2 rounded-lg {editPermissionTrigger
									? 'bg-osvauld-sensitivebgblue'
									: ''}"
								on:click="{() => {
									editPermissionTrigger = !editPermissionTrigger;
								}}"
							>
								<EditIcon />
							</button>
						{/if}
					</div>
				</div>
				<div class="items-left">
					{#if selectedTab == "Groups"}
						{#each groups as group, index}
							<ExistingListItem
								isUser="{false}"
								item="{group}"
								{index}
								{editPermissionTrigger}
								on:remove="{() => removeGroupFromCredentialHandler(group)}"
								on:permissonChange="{(e) =>
									permissionChangeHandler(e, group.groupId, 'group')}"
							/>
						{/each}
					{:else if selectedTab == "Users"}
						{#each users as user, index}
							<ExistingListItem
								isUser="{true}"
								item="{user}"
								{index}
								{editPermissionTrigger}
								on:remove="{() => removeUserFromCredentialHandler(user)}"
								on:permissonChange="{(e) =>
									permissionChangeHandler(e, user.id, 'user')}"
							/>
						{/each}
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
