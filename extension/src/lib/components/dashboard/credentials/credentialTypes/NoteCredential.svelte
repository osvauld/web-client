<script lang="ts">
	export let credentialFields;
	export let edit;
	// ... other props

	// ... Note-specific logic
</script>

<textarea
	rows="2"
	class="w-5/6 mt-4 h-auto min-h-[6rem] max-h-[10rem] bg-osvauld-frameblack rounded-lg scrollbar-thin border-osvauld-iconblack resize-none text-base focus:border-osvauld-iconblack focus:ring-0"
	bind:value="{credentialFields[0].fieldValue}"
	on:change
	placeholder="Enter note"></textarea>
