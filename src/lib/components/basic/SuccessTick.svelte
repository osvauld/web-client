<script lang="ts">
	import { onMount } from "svelte";
	import { DelegatedEvent } from "../../dtos/credential.dto";

	export let globalEvent: DelegatedEvent;
	export let isSuccess: boolean = true;

	onMount(() => {
		setTimeout(() => {
			(globalEvent.source as Window).postMessage(
				{ unmount: true },
				globalEvent.origin as string,
			);
		}, 1000);
	});
</script>

<div
	class="flex justify-center items-center w-full h-[160px] bg-osvauld-frameblack text-osvauld-quarzowhite text-lg font-light"
>
	{isSuccess ? "Success!" : "failure"}
</div>
