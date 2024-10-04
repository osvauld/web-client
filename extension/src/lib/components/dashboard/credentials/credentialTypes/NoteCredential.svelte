<script lang="ts">
	import { credentialStore } from "./credentialStore";
	import { fieldEditHandler } from "./fieldHelper";
	export let edit;
	let changedFields;

	export let isCredentialNamed = true;
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

		<textarea
			rows="2"
			class="w-5/6 mt-4 h-auto min-h-[6rem] max-h-[10rem] bg-osvauld-frameblack rounded-lg scrollbar-thin border-osvauld-iconblack resize-none text-base focus:border-osvauld-iconblack focus:ring-0"
			bind:value="{$credentialStore.credentialFields[0].fieldValue}"
			on:change="{() => {
				changedFields = fieldEditHandler(
					$credentialStore.credentialFields[0],
					$credentialStore.credentialFields,
					edit,
				);
			}}"
			placeholder="Enter note"></textarea>
	</div>
</div>
<div class=" mx-6 pl-3 flex justify-start items-center mb-5">
	<textarea
		rows="2"
		class="w-5/6 mt-4 h-auto min-h-[6rem] max-h-[10rem] bg-osvauld-frameblack rounded-lg scrollbar-thin border-osvauld-iconblack resize-none text-base focus:border-osvauld-iconblack focus:ring-0"
		bind:value="{$credentialStore.description}"
		placeholder="Enter description about the secret"></textarea>
</div>
