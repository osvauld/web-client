<script>
	import ClosePanel from "../../basic/icons/closePanel.svelte";
	import {
		modalManager,
		DeleteConfirmationModal,
		showMoreGroupOptions,
		selectedGroup,
	} from "../store";
	import { fly } from "svelte/transition";
	import { Warning } from "../icons";
	import { removeGroup } from "../apis";
	import { setGroupStore } from "../../../store/storeHelper";

	let cancelHovered = false;
	let finalActionHovered = false;

	function withdrawGroupDeleteModal() {
		showMoreGroupOptions.set(false);
		DeleteConfirmationModal.set(false);
		modalManager.set(null);
	}

	const DeleteConfirmation = async () => {
		if ($selectedGroup && $selectedGroup.groupId === $modalManager.id) {
			selectedGroup.set(null);
		}
		await removeGroup($modalManager.id);
		await setGroupStore();
		DeleteConfirmationModal.set(false);
		showMoreGroupOptions.set(false);

		modalManager.set(null);
	};
</script>

<button
	class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
	on:click|preventDefault="{withdrawGroupDeleteModal}"
>
	<div
		class="p-4 bg-osvauld-frameblack border border-osvauld-activeBorder rounded-3xl w-[32rem] h-[17.6rem] flex flex-col items-start justify-center gap-3"
		in:fly
	>
		<div class="flex justify-between items-center w-full">
			<span class="text-[21px] font-medium text-osvauld-quarzowhite"
				>Delete {$modalManager.name} group</span
			>
			<button
				class="cursor-pointer p-2"
				on:click|preventDefault="{withdrawGroupDeleteModal}"
			>
				<ClosePanel />
			</button>
		</div>
		<div
			class="border-b border-osvauld-iconblack w-[calc(100%+2rem)] -translate-x-4"
		></div>
		<div
			class=" h-[100px] w-full font-normal text-base flex justify-center items-start bg-osvauld-fieldActive rounded-lg gap-3 p-2"
		>
			<div class="w-16 h-9 justify-center items-center flex">
				<Warning />
			</div>
			<div class="text-osvauld-textActive text-left">
				Are you sure? <br /> All
				<span class="font-semibold text-osvauld-quarzowhite">credentials</span> shared
				with this group will be Revoked.
			</div>
		</div>
		<div
			class="border-b border-osvauld-iconblack w-[calc(100%+2rem)] -translate-x-4"
		></div>
		<div class="flex justify-end items-center gap-4 w-full">
			<button
				class="font-medium text-base rounded-md py-[5px] px-[15px] {cancelHovered
					? 'bg-osvauld-cancelBackground text-osvauld-quarzowhite'
					: 'text-osvauld-fadedCancel'}"
				on:click|preventDefault="{withdrawGroupDeleteModal}"
				on:mouseenter="{() => (cancelHovered = true)}"
				on:mouseleave="{() => (cancelHovered = false)}">Cancel</button
			>
			<button
				class="border border-osvauld-dangerRed py-[5px] px-[15px] text-base font-medium text-osvauld-dangerRed rounded-md {finalActionHovered
					? 'bg-osvauld-dangerRed text-osvauld-frameblack'
					: 'text-osvauld-dangerRed'}"
				on:click|preventDefault="{DeleteConfirmation}"
				on:mouseenter="{() => (finalActionHovered = true)}"
				on:mouseleave="{() => (finalActionHovered = false)}"
				>Delete Group</button
			>
		</div>
	</div>
</button>
