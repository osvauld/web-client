<script lang="ts">
	import AddLoginFields from "./AddLoginFields.svelte";
	// ... other imports

	export let credentialFields;
	export let edit;
	// ... other props

	// ... Login-specific logic
</script>

<div>
	<!-- {#each credentialFields as field, index}
      <AddLoginFields
        {field}
        {index}
        on:change
      />
    {/each} -->
	<!-- ... other Login-specific UI elements -->
</div>
