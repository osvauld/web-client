<script lang="ts">
	import BinIcon from "../../basic/icons/binIcon.svelte";
	import EditIcon from "../../basic/icons/editIcon.svelte";
	import {
		buttonRef,
		DeleteConfirmationModal,
		modalManager,
		showMoreGroupOptions,
		showRenameGroupDrawer,
	} from "../store";
	import { clickOutside } from "../helper";
	import { derived } from "svelte/store";
	import { onMount, onDestroy } from "svelte";

	let isEditHovered = false;
	let isBinHovered = false;

	function closeModal() {
		showMoreGroupOptions.set(false);
		modalManager.set(null);
	}

	export const buttonCoords = derived(buttonRef, ($buttonRef) => {
		if ($buttonRef && $modalManager != null) {
			// @ts-ignore
			const rect = $buttonRef.getBoundingClientRect();
			const leftVal =
				$modalManager.type === "Group"
					? rect.left + window.scrollX
					: rect.left + window.scrollX - 3.5 * rect.width;
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

	const deleteInitiate = () => {
		buttonRef.set(null);
		DeleteConfirmationModal.set(true);
		showMoreGroupOptions.set(false);
	};

	const renameInitiate = () => {
		buttonRef.set(null);
		showMoreGroupOptions.set(false);
		showRenameGroupDrawer.set(true);
	};

	onMount(() => {
		window.addEventListener("keydown", handleKeyDown);
	});

	onDestroy(() => {
		window.removeEventListener("keydown", handleKeyDown);
	});
</script>

{#if $showMoreGroupOptions && $buttonRef && $modalManager}
	<div
		class="absolute z-50 bg-osvauld-frameblack border border-osvauld-iconblack {$modalManager.type ===
		'Folder'
			? 'w-[166px]'
			: 'w-[130px]'} rounded-2xl"
		style="top: {$buttonCoords.top}px; left: {$buttonCoords.left}px;"
		use:clickOutside
		on:clickOutside="{handleClickOutside}"
	>
		<div class="flex flex-col items-start p-2 gap-2 w-full h-full">
			<button
				class="flex items-center p-2 gap-2 w-full h-12 text-osvauld-fieldText hover:text-osvauld-sideListTextActive hover:bg-osvauld-modalFieldActive rounded-lg"
				on:mouseenter="{() => (isEditHovered = true)}"
				on:mouseleave="{() => (isEditHovered = false)}"
				on:click|preventDefault="{renameInitiate}"
			>
				<div class="w-6 h-6 flex items-center justify-center">
					<EditIcon color="{isEditHovered ? '#F2F2F0' : '#85889C'}" />
				</div>
				<div class="font-inter text-base whitespace-nowrap">Rename</div>
			</button>

			<button
				class="flex items-center p-2 gap-2 w-full h-12 text-osvauld-fieldText hover:text-osvauld-sideListTextActive hover:bg-osvauld-modalFieldActive rounded-lg"
				on:mouseenter="{() => (isBinHovered = true)}"
				on:mouseleave="{() => (isBinHovered = false)}"
				on:click|preventDefault="{deleteInitiate}"
			>
				<div class="w-6 h-6 flex items-center justify-center">
					<BinIcon color="{isBinHovered ? '#F2F2F0' : '#85889C'}" />
				</div>
				<div class="font-inter text-base whitespace-nowrap">
					Delete {$modalManager.type === "Folder" ? "folder" : ""}
				</div>
			</button>
		</div>
	</div>
{/if}
