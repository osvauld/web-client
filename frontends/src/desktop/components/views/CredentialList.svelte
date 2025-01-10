<script lang="ts">
	import {
		selectedCategory,
		currentVault,
		credentialEditorModal,
		viewCredentialModal,
		currentCredential,
		deleteConfirmationModal,
	} from "../store/desktop.ui.store";
	import {
		CATEGORIES,
		renderRelevantHeading,
	} from "../../utils/credentialUtils";
	import { sendMessage } from "../../../lib/components/dashboard/helper";
	import Menu from "../../../icons/Menu.svelte";
	import Import from "../../../icons/Import.svelte";
	import ImportModal from "./ImportModal.svelte";

	let credentials = [];
	let prevDeleteModalState = false;
	let prevEditorModalState = false;
	let prevImportModalState = false;
	let importHovered = false;
	let importSelected = false;

	const fetchCredentials = async (vaultId: string) => {
		try {
			credentials = await sendMessage("getCredentialsForFolder", {
				folderId: vaultId,
			});
		} catch (error) {
			credentials = [];
		}
	};

	// I need this to fetch again when the import modal is closed
	$: {
		fetchCredentials($currentVault.id);
	}

	$: {
		if (prevEditorModalState && !$credentialEditorModal) {
			fetchCredentials($currentVault.id);
		}
		prevEditorModalState = $credentialEditorModal;
	}

	$: {
		if (prevDeleteModalState && !$deleteConfirmationModal) {
			fetchCredentials($currentVault.id);
		}
		prevDeleteModalState = $deleteConfirmationModal;
	}
	$: {
		if (prevImportModalState && !importSelected) {
			fetchCredentials($currentVault.id);
		}
		prevImportModalState = importSelected;
	}

	$: updatedCredentials = $selectedCategory
		? credentials.filter(
				(credential) => credential.data.credentialType === $selectedCategory,
			)
		: credentials;

	const selectedCredential = (credential) => {
		viewCredentialModal.set(true);
		currentCredential.set(credential);
	};

	const closeImportModal = async () => {
		importSelected = false;
	};
</script>

<div class="grow max-h-[85%] px-16 py-4 relative">
	{#if importSelected}
		<div
			class="fixed inset-0 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px] flex items-center justify-center z-50">
			<ImportModal on:close="{closeImportModal}" />
		</div>
	{/if}
	<div
		class="h-full overflow-y-scroll overflow-x-hidden scrollbar-thin flex flex-wrap content-start gap-3">
		{#each updatedCredentials as credential (credential.id)}
			{@const credentialType = credential.data.credentialType}
			{@const categoryInfo = CATEGORIES.find(
				(item) => item.type === credentialType,
			)}
			<button
				class="bg-osvauld-frameblack flex h-[4rem] basis-[24rem] items-center shrink-0 grow-0 rounded-xl p-3"
				on:click="{() => selectedCredential(credential)}">
				<span class="flex justify-center items-center p-2">
					{#if categoryInfo && categoryInfo.icon}
						<svelte:component this="{categoryInfo.icon}" color="{'#BFC0CC'}" />
					{:else}<span>No icon</span>
					{/if}
				</span>
				<div class="flex flex-col">
					<h3
						class="text-base text-left text-mobile-textbright truncate max-w-[16rem]">
						{renderRelevantHeading(
							credential.data.credentialFields,
							credentialType,
							credential.id,
						)}
					</h3>
					<span class="text-xs text-left text-mobile-textPrimary"
						>{credentialType}
					</span>
				</div>
				<button
					class="ml-auto p-3 flex justify-center items-center"
					on:click|stopPropagation="{() =>
						console.log('Propagation is not allowed here')}">
					<Menu />
				</button>
			</button>
		{/each}
	</div>
	{#if $currentVault.id !== "all"}
		<button
			class="text-lg absolute bottom-10 right-14 bg-osvauld-frameblack border border-osvauld-iconblack text-osvauld-sheffieldgrey hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack rounded-lg py-2 px-3.5 flex justify-center items-center"
			type="button"
			on:mouseenter="{() => (importHovered = true)}"
			on:mouseleave="{() => (importHovered = false)}"
			on:click="{() => (importSelected = true)}">
			<Import color="{importHovered ? '#0D0E13' : '#6E7681'}" />
			<span class="ml-2">Import</span>
		</button>
	{/if}
</div>
