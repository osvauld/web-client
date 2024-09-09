<script lang="ts">
	import { onMount } from "svelte";
	import { ModifiedEvent } from "../../../dtos/event.dto";

	export let iframeCustomEvent: ModifiedEvent;
	export let isSuccess: boolean = true;

	onMount(() => {
		setTimeout(() => {
			(iframeCustomEvent.source as Window).postMessage(
				{ unmount: true },
				iframeCustomEvent.origin as string,
			);
		}, 1000);
	});
</script>

<div
	class="flex justify-center items-center w-full h-[160px] bg-osvauld-frameblack text-osvauld-quarzowhite text-lg font-light"
>
	{isSuccess ? "Success!" : "failure"}
</div>
