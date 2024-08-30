<script lang="ts">
	import { onMount } from "svelte";

	export let globalEvent;
	export let isSuccess = true;

	onMount(() => {
		setTimeout(() => {
			globalEvent.source.postMessage({ unmount: true }, globalEvent.origin);
		}, 3000);
	});
</script>

<div
	class="flex justify-center items-center w-full h-[160px] bg-osvauld-frameblack text-osvauld-quarzowhite text-lg font-light"
>
	{isSuccess ? "Success!" : "failure"}
</div>
