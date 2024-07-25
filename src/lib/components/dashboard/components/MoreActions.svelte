<script lang="ts">
	import BinIcon from "../../basic/icons/binIcon.svelte";
	import EditIcon from "../../basic/icons/editIcon.svelte";
	import { FolderShare } from "../icons";
	import {
		buttonRef,
		showMoreOptions,
		DeleteConfirmationModal,
		modalManager,
		showFolderShareDrawer,
		showFolderRenameDrawer,
		showCredentialShareDrawer,
		selectedSection,
	} from "../store";
	import { clickOutside } from "../helper";
	import { derived } from "svelte/store";
	import { onMount, onDestroy } from "svelte";
	import { get } from "svelte/store";

	type MoreActionsTypes = "Folder" | "Group" | "Credential";
	let moreOptionType: MoreActionsTypes;
	let isShareHovered = false;
	let isEditHovered = false;
	let isBinHovered = false;

	function closeModal() {
		modalManager.set(null);
		showMoreOptions.set(false);
	}

	export const buttonCoords = derived(buttonRef, ($buttonRef) => {
		if ($buttonRef) {
			const rect = $buttonRef.getBoundingClientRect();
			const leftVal =
				moreOptionType === "Folder"
					? rect.left + window.scrollX
					: rect.left + window.scrollX - 2.7 * rect.width;
			return {
				top: rect.top + window.scrollY + rect.height,
				left: leftVal,
			};
		}
		return { top: 0, left: 0 };
	});

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === "Escape") {
			closeModal();
		}
	};

	const handleClickOutside = () => {
		closeModal();
	};

	const callShareFolderModal = () => {
		closeModal();
		showFolderShareDrawer.set(true);
	};

	const callShareCredentialModal = () => {
		showMoreOptions.set(false);
		showCredentialShareDrawer.set(true);
	};

	const callRenameFolderModal = () => {
		closeModal();
		showFolderRenameDrawer.set(true);
	};

	const deleteInitiate = () => {
		showMoreOptions.set(false);
		buttonRef.set(null);
		DeleteConfirmationModal.set(true);
	};

	onMount(() => {
		window.addEventListener("keydown", handleKeyDown);
		if (modalManager && get(modalManager)) {
			// @ts-ignore
			moreOptionType = get(modalManager).type;
		} else {
			closeModal();
			throw new Error("modal manager is not set");
		}
	});

	onDestroy(() => {
		window.removeEventListener("keydown", handleKeyDown);
	});
</script>

{#if $showMoreOptions && $buttonRef}
	<div
		class="absolute z-50 bg-osvauld-frameblack border border-osvauld-iconblack {moreOptionType ===
		'Folder'
			? 'w-[166px]'
			: 'w-[130px]'} rounded-2xl"
		style="top: {$buttonCoords.top}px; left: {$buttonCoords.left}px;"
		use:clickOutside
		on:clickedOutside="{handleClickOutside}"
	>
		<div class="flex flex-col items-start p-2 gap-2 w-full h-full">
			{#if $selectedSection !== "PrivateFolders"}
				<button
					class="flex justify-start gap-2 items-center w-full p-2 text-osvauld-fieldText hover:text-osvauld-sideListTextActive hover:bg-osvauld-modalFieldActive rounded-lg cursor-pointer"
					on:mouseenter="{() => (isShareHovered = true)}"
					on:mouseleave="{() => (isShareHovered = false)}"
				>
					<FolderShare
						size="{24}"
						color="{isShareHovered ? '#F2F2F0' : '#85889C'}"
					/>
					<button
						class="font-inter text-base whitespace-nowrap"
						on:click|stopPropagation="{moreOptionType === 'Folder'
							? callShareFolderModal
							: callShareCredentialModal}"
					>
						Share {moreOptionType === "Folder" ? "folder" : ""}
					</button>
				</button>
			{/if}
			{#if moreOptionType === "Folder"}
				<button
					class="flex justify-start gap-2 items-center w-full p-2 text-osvauld-fieldText hover:text-osvauld-sideListTextActive hover:bg-osvauld-modalFieldActive rounded-lg cursor-pointer"
					on:mouseenter="{() => (isEditHovered = true)}"
					on:mouseleave="{() => (isEditHovered = false)}"
					on:click|stopPropagation="{callRenameFolderModal}"
				>
					<div class="w-6 h-6 flex items-center justify-center">
						<EditIcon color="{isEditHovered ? '#F2F2F0' : '#85889C'}" />
					</div>
					<button class="font-inter text-base whitespace-nowrap">Rename</button>
				</button>
			{/if}

			<button
				class="flex justify-start gap-2 items-center w-full p-2 text-osvauld-fieldText hover:text-osvauld-sideListTextActive hover:bg-osvauld-modalFieldActive rounded-lg cursor-pointer"
				on:mouseenter="{() => (isBinHovered = true)}"
				on:mouseleave="{() => (isBinHovered = false)}"
				on:click|preventDefault="{deleteInitiate}"
			>
				<div class="w-6 h-6 flex items-center justify-center">
					<BinIcon color="{isBinHovered ? '#F2F2F0' : '#85889C'}" />
				</div>
				<div class="font-inter text-base whitespace-nowrap">
					Delete {moreOptionType === "Folder" ? "folder" : ""}
				</div>
			</button>
		</div>
	</div>
{/if}
