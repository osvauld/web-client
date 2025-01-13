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
	import Import from "../../../icons/import.svelte";
	import ImportModal from "./ImportModal.svelte";
	import Star from "../../../icons/star.svelte";
	import MenuVertical from "../../../icons/menuVertical.svelte";
	import { onMount } from "svelte";
	import CredentialOverview from "../ui/CredentialOverview.svelte";

	let clickTimer = null;
	let clickDelay = 200;
	let credentials = [];
	let prevDeleteModalState = false;
	let prevEditorModalState = false;
	let prevImportModalState = false;
	let importHovered = false;
	let importSelected = false;
	let expand = []; // { id: null, show: false }[];

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
		expand = [];
	}

	$: {
		if (prevEditorModalState && !$credentialEditorModal) {
			fetchCredentials($currentVault.id);
		}
		prevEditorModalState = $credentialEditorModal;
	}

	$: {
		if (prevDeleteModalState && !$deleteConfirmationModal.show) {
			fetchCredentials($currentVault.id);
		}
		prevDeleteModalState = $deleteConfirmationModal.show;
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

	const handleExpand = (id) => {
		const index = expand.findIndex((item) => item.id === id);
		if (index !== -1) {
			expand = expand.map((item) =>
				item.id === id ? { ...item, show: !item.show } : item,
			);
		} else {
			expand = [...expand, { id, show: true }];
		}
	};

	const closeImportModal = async () => {
		importSelected = false;
	};

	const getColumnCount = () => {
		if (typeof window === "undefined") return 1;
		if (window.innerWidth >= 1024) return 3;
		if (window.innerWidth >= 640) return 2;
		return 1;
	};

	const getColumnItems = (items, colIndex) => {
		const colCount = getColumnCount();
		return items.filter((_, index) => index % colCount === colIndex);
	};

	const handleClick = (id) => {
		if (clickTimer === null) {
			clickTimer = setTimeout(() => {
				handleExpand(id);
				clickTimer = null;
			}, clickDelay);
		}
	};

	const handleDoubleClick = (credential) => {
		if (clickTimer) {
			clearTimeout(clickTimer);
			clickTimer = null;
		}
		selectedCredential(credential);
	};
</script>

<div class="grow max-h-[85%] px-16 py-4 relative">
	{#if importSelected}
		<div
			class="fixed inset-0 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px] flex items-center justify-center z-50">
			<ImportModal on:close="{closeImportModal}" />
		</div>
	{/if}
	<div class="h-full overflow-y-auto overflow-x-hidden pr-4">
		<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
			{#each Array(getColumnCount()) as _, colIndex}
				<div class="flex flex-col gap-3">
					{#each getColumnItems(updatedCredentials, colIndex) as credential (credential.id)}
						{@const credentialType = credential.data.credentialType}
						{@const categoryInfo = CATEGORIES.find(
							(item) => item.type === credentialType,
						)}
						<div class="min-w-0">
							<button
								class="bg-osvauld-frameblack w-full border border-osvauld-cardBorder rounded-xl p-4"
								on:dblclick|stopPropagation="{() =>
									handleDoubleClick(credential)}"
								on:click|stopPropagation="{() => handleClick(credential.id)}">
								<div class="flex items-center mb-4">
									<span
										class="flex justify-center items-center p-2.5 bg-osvauld-fieldActive rounded-md mr-3">
										{#if categoryInfo && categoryInfo.icon}
											<svelte:component
												this="{categoryInfo.icon}"
												color="{'#BFC0CC'}" />
										{:else}
											<span>!</span>
										{/if}
									</span>
									<button
										class="ml-auto p-2.5 bg-osvauld-fieldActive rounded-md flex justify-center items-center">
										<Star />
									</button>
									<button
										class="ml-3 p-2.5 bg-osvauld-fieldActive rounded-md flex justify-center items-center"
										on:click|stopPropagation="{() =>
											console.log('Menu clicked')}">
										<MenuVertical />
									</button>
								</div>
								<div class="flex flex-col">
									<h3
										class="font-Jakarta text-xl font-medium text-left text-mobile-textbright truncate max-w-[16rem]">
										{renderRelevantHeading(
											credential.data.credentialFields,
											credentialType,
											credential.id,
										)}
									</h3>
									<span class="text-xs text-left text-mobile-textPrimary">
										{credentialType}
									</span>
								</div>
								{#if expand.find((item) => item.id === credential.id)?.show}
									<CredentialOverview
										type="{credentialType}"
										fields="{credential.data.credentialFields}" />
								{/if}
							</button>
						</div>
					{/each}
				</div>
			{/each}
		</div>
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
