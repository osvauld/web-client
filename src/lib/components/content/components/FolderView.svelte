<script lang="ts">
	import { onMount } from "svelte";
	import ListToggle from "../../basic/ListToggle.svelte";

	let switchValue;

	onMount(() => {
		console.log("Mounted Folder view");
	});
</script>

<div class="w-full h-full relative">
	{switchValue}
	<span class="absolute -top-9 right-2"
		><ListToggle bind:value="{switchValue}" /></span
	>
</div>
