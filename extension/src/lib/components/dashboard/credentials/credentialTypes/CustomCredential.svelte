<script lang="ts">
	import AddCustomFields from "./AddCustomFields.svelte";
	// ... other imports

	export let credentialFields;
	export let edit;
	// ... other props

	// ... Custom credential-specific logic
</script>

<div>
	<!-- {#each credentialFields as field, index}
      <AddCustomFields
        {field}
        {index}
        on:change
        // ... other props and event handlers
      />
    {/each} -->
	<!-- ... other Custom credential-specific UI elements -->
</div>
