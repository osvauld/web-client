<script>
	import { onMount } from "svelte";

	export let globalEvent;

	onMount(() => {
		setTimeout(() => {
			// Setting success to false in content script to close the iFrame, even though the we saved it sucessfully
			globalEvent.source.postMessage({ unmount: true }, globalEvent.origin);
		}, 1000);
	});
</script>

<div
	class="flex justify-center items-center w-full h-[160px] bg-osvauld-frameblack text-osvauld-quarzowhite text-lg font-light"
>
	Success!
</div>
