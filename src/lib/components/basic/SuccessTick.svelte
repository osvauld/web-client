<script>
	import { onMount } from "svelte";

	export let globalEvent;

	onMount(() => {
		setTimeout(() => {
			globalEvent.source.postMessage({ unmount: true }, globalEvent.origin);
		}, 2000);
	});
</script>

<div
	class="flex justify-center items-center w-full h-[160px] bg-osvauld-frameblack text-osvauld-quarzowhite text-lg font-light"
>
	Success!
</div>
