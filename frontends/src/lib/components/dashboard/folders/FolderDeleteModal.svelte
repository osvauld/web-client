<script>
	import ClosePanel from "../../basic/icons/closePanel.svelte";
	import {
		modalManager,
		DeleteConfirmationModal,
		showMoreOptions,
		selectedFolder,
		credentialStore,
		toastStore,
	} from "../store";
	import { fly } from "svelte/transition";
	import { Warning } from "../icons";
	import { setFolderStore } from "../../../store/storeHelper";

	let cancelHovered = false;
	let finalActionHovered = false;

	function withdrawFolderDeleteModal() {
		showMoreOptions.set(false);
		DeleteConfirmationModal.set(false);
		modalManager.set(null);
	}

	async function DeleteConfirmation() {
		// if ($selectedFolder && $selectedFolder.id === $modalManager.id) {
		// 	selectedFolder.set(null);
		// 	credentialStore.set([]);
		// }
		// let removalResponse = await removeFolder($modalManager.id);
		// if (removalResponse.success) {
		// 	toastStore.set({
		// 		type: removalResponse.success,
		// 		message: removalResponse.message,
		// 		show: true,
		// 	});
		// }
		withdrawFolderDeleteModal();
		await setFolderStore();
	}
</script>

<button
	class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
	on:click|preventDefault="{withdrawFolderDeleteModal}">
	<div
		class="p-4 bg-osvauld-frameblack border border-osvauld-activeBorder rounded-3xl w-[32rem] h-[17.6rem] flex flex-col items-start justify-center gap-3"
		in:fly>
		<div class="flex justify-between items-center w-full">
			<span class="text-[21px] font-medium text-osvauld-quarzowhite"
				>Delete {$modalManager.name} folder</span>
			<button
				class="cursor-pointer p-2"
				on:click|preventDefault="{withdrawFolderDeleteModal}">
				<ClosePanel />
			</button>
		</div>
		<div
			class="border-b border-osvauld-iconblack w-[calc(100%+2rem)] -translate-x-4">
		</div>
		<div
			class=" h-[140px] w-full font-normal text-base flex justify-center items-start bg-osvauld-fieldActive rounded-lg gap-3 p-2">
			<div class="w-16 h-9 justify-center items-center flex">
				<Warning />
			</div>
			<div class="text-osvauld-textActive text-left">
				Are you sure? <br /> All
				<span class="font-semibold text-osvauld-quarzowhite">credentials</span> within
				this folder will be permanently deleted. Users and groups with access to
				this folder will no longer be able to view or manage the credentials
			</div>
		</div>
		<div
			class="border-b border-osvauld-iconblack w-[calc(100%+2rem)] -translate-x-4">
		</div>
		<div class="flex justify-end items-center gap-4 w-full">
			<button
				class="font-medium text-base rounded-md py-[5px] px-[15px] {cancelHovered
					? 'bg-osvauld-cancelBackground text-osvauld-quarzowhite'
					: 'text-osvauld-fadedCancel'}"
				on:click|preventDefault="{withdrawFolderDeleteModal}"
				on:mouseenter="{() => (cancelHovered = true)}"
				on:mouseleave="{() => (cancelHovered = false)}">Cancel</button>
			<button
				class="border border-osvauld-dangerRed py-[5px] px-[15px] text-base font-medium text-osvauld-dangerRed rounded-md {finalActionHovered
					? 'bg-osvauld-dangerRed text-osvauld-frameblack'
					: 'text-osvauld-dangerRed'}"
				on:click|preventDefault="{DeleteConfirmation}"
				on:mouseenter="{() => (finalActionHovered = true)}"
				on:mouseleave="{() => (finalActionHovered = false)}"
				>Delete Folder</button>
		</div>
	</div>
</button>
