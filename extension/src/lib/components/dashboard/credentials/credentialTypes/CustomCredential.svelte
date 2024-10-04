<script lang="ts">
	import AddLoginFields from "../AddLoginFields.svelte";
	import { Add, BinIcon } from "../../icons";
	import { credentialStore, credentialFieldsStore } from "./credentialStore";
	import { AddCredentialField } from "../../dtos";
	export let edit;

	export let isCredentialNamed = true;

	const newField = {
		fieldName: "",
		fieldValue: "",
		sensitive: false,
	};

	function addNewField() {
		credentialFieldsStore.update((fields) => [...fields, newField]);
	}
</script>

<div class="mx-6">
	<div class="min-h-[32vh] max-h-[35vh] overflow-y-scroll scrollbar-thin z-50">
		<input
			class="w-[78%] mb-2 mt-4 ml-6 pl-4 bg-osvauld-frameblack
   border rounded-md text-base text-osvauld-quarzowhite font-normal
   focus:border-osvauld-activeBorder flex focus:ring-0 placeholder-osvauld-iconblack {!isCredentialNamed
				? 'border-red-500'
				: 'border-osvauld-iconblack '}"
			id="name"
			type="text"
			placeholder="Enter Credential name...."
			autocomplete="off"
			bind:value="{$credentialStore.name}" />
		{#each $credentialStore.credentialFields as field, index}
			{#if field.fieldName !== "Domain"}
				<!-- <AddLoginFields
					{field}
					{index}
					{hoveredIndex}
					on:select="{(e) =>
						triggerSensitiveBubble(e.detail.index, e.detail.identifier)}"
					on:remove="{(e) => removeField(e.detail)}"
					on:change="{() => {
						fieldEditHandler(field);
					}}" /> -->
			{/if}
		{/each}
	</div>
	<div class="flex mr-24">
		<button
			class="py-2 m-4 bg-osvauld-addfieldgrey flex-1 flex justify-center items-center rounded-md text-osvauld-chalkwhite border-2 border-dashed border-osvauld-iconblack"
			on:click="{addNewField}"
			type="button">
			<Add color="{'#6E7681'}" />
		</button>
	</div>
</div>
<div class=" mx-6 pl-3 flex justify-start items-center mb-5">
	<textarea
		rows="2"
		class="w-5/6 mt-4 h-auto min-h-[6rem] max-h-[10rem] bg-osvauld-frameblack rounded-lg scrollbar-thin border-osvauld-iconblack resize-none text-base focus:border-osvauld-iconblack focus:ring-0"
		bind:value="{$credentialStore.description}"
		placeholder="Enter description about the secret"></textarea>
</div>
