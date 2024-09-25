<script>
	import ClosePanel from "../../basic/icons/closePanel.svelte";
	import {
		modalManager,
		DeleteConfirmationModal,
		showMoreOptions,
	} from "../store";
	import { fly } from "svelte/transition";
	import { Warning } from "../icons";
	import { removeCredential } from "../apis";
	import { setCredentialStore } from "../../../store/storeHelper";

	let cancelHovered = false;
	let finalActionHovered = false;

	function withdrawCredentialDeleteModal() {
		modalManager.set(null);
		showMoreOptions.set(false);
		DeleteConfirmationModal.set(false);
	}

	const removeCredentialHandler = async (credentialId) => {
		await removeCredential(credentialId);
		await setCredentialStore();
	};

	async function DeleteConfirmation() {
		await removeCredentialHandler($modalManager.id);
		withdrawCredentialDeleteModal();
	}
</script>

<button
	class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
	on:click|preventDefault="{withdrawCredentialDeleteModal}"
>
	<div
		class="p-4 bg-osvauld-frameblack border border-osvauld-activeBorder rounded-3xl w-[32rem] h-[14rem] flex flex-col items-start justify-center gap-3"
		in:fly
	>
		<div class="flex justify-between items-center w-full">
			<span class="text-[21px] font-medium text-osvauld-quarzowhite"
				>Delete {$modalManager.name}</span
			>
			<button
				class="cursor-pointer p-2"
				on:click|preventDefault="{withdrawCredentialDeleteModal}"
			>
				<ClosePanel />
			</button>
		</div>
		<div
			class="border-b border-osvauld-iconblack w-[calc(100%+2rem)] -translate-x-4"
		></div>
		<div
			class=" w-full font-normal text-base flex justify-start items-center bg-osvauld-fieldActive rounded-lg gap-3 p-2"
		>
			<div class="justify-center items-center flex">
				<Warning />
			</div>
			<div class="text-osvauld-textActive text-left">
				Are you sure? This action cannot be undone.
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
				on:click|preventDefault="{withdrawCredentialDeleteModal}"
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
				>Delete Credential</button
			>
		</div>
	</div>
</button>
