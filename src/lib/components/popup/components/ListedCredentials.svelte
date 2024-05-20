<script>
	import CredentialPopupCard from "../../dashboard/components/CredentialPopupCard.svelte";
	import { RightArrow, DownArrow } from "../icons";
	export let credential;
	export let selectedCredentialId;
	export let clickedCredential;
	import { createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher();
	const dropDownClicked = () => {
		dispatch("select", { credentialId: credential.credentialId });
	};
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
	{#if selectedCredentialId == credential.credentialId}
		<div class="border-b border-osvauld-iconblack w-full mb-3"></div>
		<CredentialPopupCard credential="{clickedCredential}" />
	{/if}
</button>
