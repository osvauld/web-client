<script lang="ts">
	import {
		currentCredential,
		viewCredentialModal,
		currentVault,
		deleteConfirmationModal,
	} from "../store/desktop.ui.store";

	import { scale } from "svelte/transition";

	import Tick from "../../../icons/tick.svelte";
	import CopyIcon from "../../../icons/copyIcon.svelte";
	import More from "../../../icons/more.svelte";
	import Edit from "../../../icons/editIcon.svelte";
	import MobileHome from "../../../icons/mobileHome.svelte";
	import ClosePanel from "../../../icons/closePanel.svelte";
	import Share from "../../../icons/FolderShare.svelte";
	import Star from "../../../icons/star.svelte";
	import Bin from "../../../icons/binIcon.svelte";

	import { writeToClipboard } from "../../../lib/components/dashboard/helper";

	let copied = false;
	let copiedItemIndex;

	const CloseViewModal = () => {
		viewCredentialModal.set(false);
		currentCredential.set({});
	};

	const copyToClipboard = async (fieldValue, index) => {
		copiedItemIndex = index;
		copied = true;

		writeToClipboard(fieldValue);
		setTimeout(() => {
			copied = false;
			copiedItemIndex = null;
		}, 1000);
	};

	const handleCredentialDelete = () => {
		viewCredentialModal.set(false);
		deleteConfirmationModal.set(true);
	};
</script>

<div
	class="fixed inset-0 z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[0.5px] flex justify-end">
	<div
		class="w-[23.5rem] h-full flex flex-col bg-osvauld-ninjablack border-l border-l-osvauld-sideListHighlight p-3">
		<div class="w-full h-[48px] px-3 flex items-center gap-2 flex-shrink-0">
			<button
				on:click="{CloseViewModal}"
				class="p-2.5 rounded-lg bg-mobile-bgSeconary">
				<ClosePanel size="{24}" />
			</button>
			<span class="ml-auto p-2.5 rounded-lg bg-mobile-bgSeconary"
				><Edit size="{24}" /></span>
			<span class="p-2.5 rounded-lg bg-mobile-bgSeconary"><Share /></span>
			<span class="p-2.5 rounded-lg bg-mobile-bgSeconary"><Star /></span>
			<span class="p-2.5 rounded-lg bg-mobile-bgSeconary"
				><More color="#85889C" /></span>
		</div>
		<div
			class="text-mobile-textPrimary text-2xl font-medium flex flex-col pl-4 py-3">
			<span class="text-mobile-textTertiary"
				>{$currentCredential.data.credentialType}</span>
			<div
				class="flex text-sm font-light gap-1 items-center tracking-wider capitalize">
				<span><MobileHome size="{14}" color="{'#85889C'}" /></span>
				<span>{$currentVault.name}</span>
			</div>
		</div>
		<div
			class="grow p-4 text-mobile-textPrimary overflow-y-auto scrollbar-thin flex flex-col gap-2 mt-2">
			{#each $currentCredential.data.credentialFields as field, index (field.fieldName)}
				{#if field.fieldValue.trim().length !== 0}
					<span class="text-mobile-textlabel text-sm">{field.fieldName}</span>
					<div class="flex gap-2">
						<div
							class="bg-mobile-bgSeconary rounded-lg py-2.5 px-4 flex-1 max-w-full truncate">
							<span class=" text-mobile-textField text-base"
								>{field.fieldValue}</span>
						</div>
						<button
							class="bg-mobile-bgSeconary rounded-lg p-3"
							on:click|preventDefault|stopPropagation="{() =>
								copyToClipboard(field.fieldValue, index)}">
							{#if copied && copiedItemIndex === index}
								<span in:scale>
									<Tick />
								</span>
							{:else}
								<CopyIcon color="{'#85889C'}" />
							{/if}
						</button>
					</div>
				{/if}
			{/each}

			<hr class="border border-mobile-bgSeconary my-3" />
			<div
				class="bg-mobile-bgSeconary rounded-lg h-[65px] p-3 text-mobile-textPrimary text-sm mt-auto flex justify-between items-center">
				<span>
					Created at : <br />
					<span class="text-xs"
						>{new Date().toLocaleTimeString() +
							"," +
							new Date().toLocaleDateString()}</span>
				</span>
				<button class="p-2" on:click|stopPropagation="{handleCredentialDelete}"
					><Bin color="#FF6A6A" /></button>
			</div>
		</div>
	</div>
</div>
