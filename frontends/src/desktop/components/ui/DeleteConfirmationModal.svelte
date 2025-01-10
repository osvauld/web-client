<script>
	import ClosePanel from "../../../icons/closePanel.svelte";
	import {
		currentCredential,
		currentVault,
		deleteConfirmationModal,
		toastStore,
	} from "../store/desktop.ui.store";
	import { renderRelevantHeading } from "../../utils/credentialUtils";
	import { fly } from "svelte/transition";
	import Warning from "../../../icons/warning.svelte";
	import { sendMessage } from "../../../lib/components/dashboard/helper";
	import { onMount } from "svelte";

	const DeleteConfirmation = () => {
		// TODO: Call the API to delete the credential or folder
		// await sendMessage("deleteCredential", { id: currentCredential.id });
		// or await sendMessage("deleteFolder", { id: $currentVault.id.id });
		toastStore.set({
			show: true,
			message: `${$currentCredential?.id ? "Credential" : "Folder"} deleted successfully`,
			success: true,
		});
		// toastStore.set({
		// 	show: true,
		// 	message: `${$currentCredential?.id ? "Credential" : "Folder"} deletion failed`,
		// 	success: false,
		// });
		deleteConfirmationModal.set(false);
	};

	const withdrawCredentialDeleteModal = () => {
		currentCredential.set({});
		deleteConfirmationModal.set(false);
	};
</script>

<button
	class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
	on:click|preventDefault="{withdrawCredentialDeleteModal}">
	<form
		class="p-4 bg-osvauld-frameblack border border-osvauld-activeBorder rounded-3xl w-[32rem] h-[14rem] flex flex-col items-start justify-center gap-3"
		in:fly
		on:submit|preventDefault|stopPropagation="{DeleteConfirmation}">
		<div class="flex justify-between items-center w-full">
			<span class="text-[21px] font-medium text-osvauld-quarzowhite capitalize"
				>Delete {$currentCredential?.id
					? renderRelevantHeading(
							$currentCredential.data.credentialFields,
							$currentCredential.data.credentialType,
							$currentCredential.id,
						)
					: $currentVault.name} ?
			</span>
			<button
				class="cursor-pointer p-2"
				on:click|stopPropagation="{withdrawCredentialDeleteModal}">
				<ClosePanel />
			</button>
		</div>
		<div
			class="border-b border-osvauld-iconblack w-[calc(100%+2rem)] -translate-x-4">
		</div>
		<div
			class=" w-full font-normal text-base flex justify-start items-center bg-osvauld-fieldActive rounded-lg gap-3 p-2">
			<div class="justify-center items-center flex">
				<Warning />
			</div>
			<div class="text-osvauld-textActive text-left">
				Are you sure? This action cannot be undone.
			</div>
		</div>
		<div
			class="border-b border-osvauld-iconblack w-[calc(100%+2rem)] -translate-x-4">
		</div>
		<div class="flex justify-end items-center gap-4 w-full">
			<button
				class="font-medium text-base rounded-md py-[5px] px-[15px] text-osvauld-fadedCancel hover:bg-osvauld-cancelBackground hover:text-osvauld-quarzowhite transition-all"
				on:click="{withdrawCredentialDeleteModal}">Cancel</button>
			<button
				class="border border-osvauld-dangerRed py-[5px] px-[15px] text-base font-medium text-osvauld-dangerRed rounded-md hover:bg-osvauld-dangerRed hover:text-osvauld-frameblack transition-all"
				type="submit"
				on:click="{DeleteConfirmation}"
				>Delete {$currentCredential?.id ? "Credential" : "Folder"}</button>
		</div>
	</form>
</button>
