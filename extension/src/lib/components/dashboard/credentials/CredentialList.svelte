<script lang="ts">
	import { fly } from "svelte/transition";
	import CredentialEditorMod from "./CredentialEditorMod.svelte";
	import CredentialCard from "./CredentialCard.svelte";
	// import CredentialDetails from "./CredentialDetails.svelte";

	import { Add, Import } from "../icons";
	import { User, Credential, Field } from "../dtos";

	import {
		credentialStore,
		selectedFolder,
		showCredentialDetailsDrawer,
		selectedCredential,
	} from "../store";
	import DownArrow from "../../basic/icons/downArrow.svelte";
	import Placeholder from "../components/Placeholder.svelte";
	import { buttonRef } from "../../../store/ui.store";
	import { setCredentialStore } from "../../../store/storeHelper";
	import ImportModal from "./ImportModal.svelte";

	let checkedCards: Credential[] = [];
	let sensitiveFields: Field[] = [];
	let showCreateCredentialModal = false;
	let addCredentialHovered = false;
	let importHovered = false;
	let importSelected = false;
	let selectedCard: any;
	const withdrawDetailDrawer = () => {
		showCredentialDetailsDrawer.set(false);
	};

	const addCredentialManager = () => {
		showCreateCredentialModal = true;
		checkedCards = [];
	};

	const onSelectingCard = (
		sensitiveFieldsfromCard: Field[],
		credential: Credential,
	) => {
		sensitiveFields = [...sensitiveFieldsfromCard];
		selectedCard = credential;
		showCredentialDetailsDrawer.set(true);
	};

	const closeImportModal = async () => {
		importSelected = false;
		await setCredentialStore();
	};
</script>

<style>
	.tooltip {
		position: absolute;
		top: 45px;
		right: -20px;
		border: 1px solid #2f303e;
		background-color: #0d0e13;
		color: #6e7681;
		padding: 3px 10px;
		border-radius: 6px;
		font-size: 12px;
		white-space: nowrap;
		z-index: 10;
	}
</style>

{#if $showCredentialDetailsDrawer}
	<button
		class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
		on:click="{withdrawDetailDrawer}">
		<button class="p-6 rounded bg-transparent" on:click|stopPropagation>
			<CredentialDetails
				credential="{selectedCard}"
				{sensitiveFields}
				on:close="{withdrawDetailDrawer}" />
		</button>
	</button>
{/if}

<div class="w-full min-h-[80vh]">
	{#if $selectedFolder}
		<div class="flex justify-between items-center px-4 py-2">
			<div class="max-w-[50%] min-w-[30%] flex items-center">
				<h1
					class="text-3xl p-4 font-normal whitespace-nowrap text-osvauld-sideListTextActive">
					{$selectedFolder.name}
				</h1>
			</div>
			<div class="w-[40%] flex justify-end items-center">
				<button
					class="border border-osvauld-iconblack text-osvauld-textPassive hidden justify-center items-center py-1.5 px-4 text-sm rounded-md ml-4">
					<span class="mr-2 pl-2">Latest</span>
					<DownArrow type="{'common'}" />
				</button>
				<button
					class="rounded-md py-1.5 px-4 mx-2 flex justify-center items-center whitespace-nowrap text-sm border text-osvauld-textActive border-osvauld-iconblack hover:text-osvauld-frameblack hover:bg-osvauld-carolinablue {$selectedFolder.accessType ===
					'manager'
						? 'visible'
						: 'hidden'}"
					on:mouseenter="{() => (addCredentialHovered = true)}"
					on:mouseleave="{() => (addCredentialHovered = false)}"
					on:click="{addCredentialManager}">
					<span class="mr-2">Add New Credential</span>
					<Add color="{addCredentialHovered ? '#0D0E13' : '#A3A4B5'}" />
				</button>
			</div>
		</div>
	{:else}
		<div class="w-full max-h-[100vh] min-h-[70vh] mt-20">
			<Placeholder />
		</div>
	{/if}
	{#if showCreateCredentialModal}
		<button
			class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
			on:click="{() => !showCreateCredentialModal}">
			<button class="p-6 rounded bg-transparent" on:click|stopPropagation>
				<CredentialEditorMod
					on:close="{() => (showCreateCredentialModal = false)}" />
			</button>
		</button>
	{/if}
	{#if importSelected}
		<div
			class="fixed inset-0 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px] flex items-center justify-center z-50">
			<ImportModal on:close="{closeImportModal}" />
		</div>
	{/if}
	{#if $credentialStore.length !== 0}
		<div
			class="flex flex-wrap pt-3 pb-7 px-7 gap-3.5 w-full max-h-[80vh] !overflow-y-scroll scrollbar-thin box-border">
			{#each $credentialStore as credential}
				<CredentialCard
					{credential}
					checked="{checkedCards.some(
						(c) => c.credentialId === credential.credentialId,
					)}"
					on:select="{(e) => onSelectingCard(e.detail, credential)}" />
			{/each}
		</div>
	{/if}
	{#if $selectedFolder && $selectedFolder.accessType === "manager"}
		<button
			class="text-2xl absolute bottom-10 right-14 bg-osvauld-frameblack border border-osvauld-iconblack text-osvauld-sheffieldgrey hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack rounded-lg py-2 px-3.5 flex justify-center items-center"
			type="button"
			on:mouseenter="{() => (importHovered = true)}"
			on:mouseleave="{() => (importHovered = false)}"
			on:click="{() => (importSelected = true)}">
			<Import color="{importHovered ? '#0D0E13' : '#6E7681'}" />
			<span class="ml-2">Import</span>
		</button>
	{/if}
</div>
