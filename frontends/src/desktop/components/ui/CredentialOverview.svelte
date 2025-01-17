<script lang="ts">
	import { slide, scale } from "svelte/transition";
	import { writeToClipboard } from "../../../lib/components/dashboard/helper";
	import LL from "../../../i18n/i18n-svelte";
	import Tick from "../../../icons/tick.svelte";
	import CopyIcon from "../../../icons/copyIcon.svelte";

	export let type;
	export let fields;
	let copied = false;
	let copiedItemIndex = null;

	const copyToClipboard = async (fieldValue, index) => {
		copiedItemIndex = index;
		copied = true;

		writeToClipboard(fieldValue);
		setTimeout(() => {
			copied = false;
			copiedItemIndex = null;
		}, 1000);
	};
</script>

<div
	class="mt-3 bg-mobile-bgSeconary
 rounded-lg transition-all duration-300 flex flex-col items-start"
	in:slide
	out:slide>
	{#if type === "Note"}
		{@const value = fields.find(
			(item) => item.fieldName === "Note",
		)?.fieldValue}
		<div class="w-full flex flex-col gap-4">
			<div
				class="bg-osvauld-fieldActive rounded-lg py-2.5 px-4 w-full min-h-28 h-auto max-h-[15rem]">
				<p
					class="text-left text-mobile-textField text-base text-wrap break-all line-clamp-[9]">
					{value || "Regret"}
				</p>
			</div>
			<button
				class="bg-osvauld-fieldActive rounded-lg p-3 w-full flex gap-2 justify-center items-center"
				on:click|preventDefault|stopPropagation="{() =>
					copyToClipboard(value, 0)}">
				<span class="text-osvauld-fieldText font-Jakarta font-medium text-lg"
					>{$LL.copyNote()}</span>
				{#if copied && copiedItemIndex === 0}
					<span in:scale>
						<Tick />
					</span>
				{:else}
					<CopyIcon color="{'#85889C'}" />
				{/if}
			</button>
		</div>
	{:else}
		{#each fields as field, index (field.fieldName)}
			{#if field.fieldValue.trim().length !== 0}
				<span class="text-osvauld-fadedCancel text-sm">{field.fieldName}</span>
				<div class="flex gap-2 w-full">
					<div
						class="bg-osvauld-fieldActive rounded-lg py-2.5 px-4 flex-1 max-w-full truncate">
						<span class="text-left text-mobile-textField text-base"
							>{field.fieldValue}</span>
					</div>
					<button
						class="bg-osvauld-fieldActive rounded-lg p-3"
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
	{/if}
</div>
