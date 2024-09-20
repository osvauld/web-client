<script>
	import { onMount } from "svelte";
	import {
		fetchCredentialById,
		fetchSensitiveFieldsByCredentialId,
	} from "../../dashboard/apis";
	import CredentialPopupCard from "../../dashboard/components/CredentialPopupCard.svelte";
	import { sendMessage } from "../../dashboard/helper";
	import { RightArrow, DownArrow } from "../icons";
	import { createEventDispatcher } from "svelte";
	import { LocalStorageService } from "../../../../scripts/storageHelper";
	const dispatch = createEventDispatcher();
	export let credential;
	export let selectedCredentialId;
	let credentialDetails;
	let credentialClicked = false;
	const dropDownClicked = async () => {
		const credentialValues = await Promise.all([
			fetchCredentialById(credential.credentialId),
			fetchSensitiveFieldsByCredentialId(credential.credentialId),
		]);
		credentialDetails = credentialValues[0].data;
		const credentialDecryptedResponse = await sendMessage("decryptMeta", [
			credentialDetails,
		]);
		credentialDetails = credentialDecryptedResponse[0];
		credentialDetails.fields = [
			...credentialDetails.fields,
			...credentialValues[1].data,
		];
		selectedCredentialId = credential.credentialId;
		credentialClicked = !credentialClicked;
		LocalStorageService.set("selectedCredentialId", selectedCredentialId);
		dispatch("credentialClicked", { credentialId: credential.credentialId });
	};
	onMount(async () => {
		if (selectedCredentialId === credential.credentialId) {
			await dropDownClicked();
		}
	});
</script>

<button
	class="rounded-lg hover:shadow-[0_0_0_1px_#B4BEFE] hover:!text-osvauld-fieldTextActive bg-osvauld-cardshade px-1 py-2 font-bold text-osvauld-sheffieldgrey flex
  flex-col justify-center items-center w-[95%] mx-auto mb-3 cursor-pointer {selectedCredentialId ===
	credential.credentiaId
		? 'border border-osvauld-iconblack'
		: ''}"
	on:click="{dropDownClicked}"
>
	<div
		class="w-full flex justify-between items-center px-4 {selectedCredentialId ===
		credential.credentialId
			? 'text-osvauld-quarzowhite mb-2'
			: 'mb-0'}"
	>
		<span
			class="text-base font-normal tracking-wide text-osvauld-fieldText overflow-hidden whitespace-nowrap text-ellipsis"
			>{credential.name}</span
		>
		<button class="px-4 py-1 cursor-pointer">
			{#if selectedCredentialId === credential.credentialId}
				<DownArrow type="{'common'}" />
			{:else}
				<RightArrow />
			{/if}
		</button>
	</div>
	{#if selectedCredentialId == credential.credentialId && credentialClicked}
		<div class="border-b border-osvauld-iconblack w-full mb-3"></div>
		<CredentialPopupCard credential="{credentialDetails}" />
	{/if}
</button>
