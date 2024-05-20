<script lang="ts">
	import EncryptedField from "./EncryptedField.svelte";
	import { ActiveCopy } from "../icons";
	export let fields;
	const copyToClipboard = (username: string) => {
		navigator.clipboard.writeText(username);
	};
</script>

<div
	class="h-[10rem] bg-osvauld-frameblack border border-osvauld-iconblack p-2 w-full rounded-lg overflow-y-scroll scrollbar-thin"
>
	{#each fields as field}
		{#if field.fieldType === "sensitive"}
			<EncryptedField
				fieldName="{field.fieldName}"
				fieldValue="{field.fieldValue}"
			/>
		{:else}
			<div class="mb-2">
				<label
					class="label block mb-2 text-left text-osvauld-dusklabel text-sm font-normal"
					for="{`input-${field.fieldName}`}">{field.fieldName}</label
				>
				<div
					class="w-full rounded-lg bg-osvauld-fieldActive text-osvauld-textActive font-normal text-sm flex justify-between items-center px-2 py-1"
				>
					<span>{field.fieldValue}</span>
					<button
						class="scale-[0.8] active:scale-75"
						on:click|stopPropagation="{() =>
							copyToClipboard(field.fieldValue)}"
						><ActiveCopy />
					</button>
				</div>
			</div>
		{/if}
	{/each}
</div>
