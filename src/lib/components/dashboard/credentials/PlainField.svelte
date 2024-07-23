<script lang="ts">
	import { scale } from "svelte/transition";
	import { ActiveCopy, Tick, CopyIcon } from "../icons";
	export let fieldName: string;
	export let fieldValue: string;
	export let hoverEffect: boolean;
	export let copied = false;

	const copyToClipboard = async () => {
		copied = true;
		await navigator.clipboard.writeText(fieldValue);
		setTimeout(() => {
			copied = false;
		}, 2000);
	};
</script>

<div class="mb-2.5 mr-1 max-w-full">
	<label
		class="label block mb-1 text-left text-osvauld-dusklabel whitespace-nowrap text-ellipsis text-xs font-normal cursor-pointer"
		for="field">{fieldName}</label
	>
	<div
		class="py-1 px-3 w-full flex justify-between items-center text-base {hoverEffect
			? 'text-osvauld-fieldTextActive bg-osvauld-fieldActive rounded-md'
			: 'text-osvauld-fieldText rounded-none border-b border-osvauld-darkLineSeperator'}"
	>
		<span
			class="w-full text-left overflow-x-hidden font-normal whitespace-nowrap text-ellipsis text-sm"
			>{fieldValue}</span
		>
		<button on:click|preventDefault|stopPropagation="{copyToClipboard}">
			{#if copied}
				<span in:scale>
					<Tick />
				</span>
			{:else if hoverEffect}
				<ActiveCopy />
			{:else}
				<CopyIcon color="{'#4D4F60'}" />
			{/if}
		</button>
	</div>
</div>
