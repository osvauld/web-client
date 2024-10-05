<script lang="ts">
	import { Add } from "../../icons";
	import AddLoginFields from "../AddLoginFields.svelte";
	import { credentialStore, credentialFieldsStore } from "./credentialStore";
	import { fieldEditHandler } from "./fieldHelper";
	export let edit;
	let changedFields;
	export let hoveredIndex;

	export let isCredentialNamed = true;
</script>

<div class="mx-6">
	<div
		class="min-h-[32vh] max-h-[35vh] overflow-y-scroll scrollbar-thin z-50 flex flex-col">
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

		<div class="invisible pointer-events-none">
			{#each $credentialFieldsStore as field, index}
				<AddLoginFields {field} {index} {hoveredIndex} />
			{/each}
		</div>
		<textarea
			rows="6"
			class=" w-[78%] mt-4 ml-6 h-auto min-h-[6rem] max-h-[10rem] bg-osvauld-frameblack rounded-lg scrollbar-thin border-osvauld-iconblack resize-none text-base focus:border-osvauld-iconblack focus:ring-0"
			placeholder="Enter note"></textarea>
	</div>
	<div class="flex mr-24">
		<div
			class="invisible pointer-events-none py-2 m-4 bg-osvauld-addfieldgrey flex-1 flex justify-center items-center rounded-md text-osvauld-chalkwhite border-2 border-dashed border-osvauld-iconblack">
			<Add />
		</div>
	</div>
</div>
<div class="mx-6 flex justify-start items-center mb-5">
	<textarea
		rows="2"
		class="w-[78%] ml-6 mt-4 h-auto min-h-[6rem] max-h-[10rem] bg-osvauld-frameblack rounded-lg scrollbar-thin border-osvauld-iconblack resize-none text-base focus:border-osvauld-iconblack focus:ring-0"
		bind:value="{$credentialStore.description}"
		placeholder="Enter description about the note"></textarea>
</div>
