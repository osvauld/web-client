<script>
	import { onMount } from "svelte";

	export let globalEvent;
	let success = true;

	onMount(() => {
		window.addEventListener("message", (event) => {
			if (event.data.id !== "osvauld") {
				return;
			}
			globalEvent = {
				data: event.data,
				source: event.source,
				origin: event.origin,
			};

			if (event.data.success) {
				success = true;
				setTimeout(() => {
					globalEvent.source.postMessage({ unmount: true }, globalEvent.origin);
				}, 2000);
			} else {
				success = true;
			}
			// console.log("Data as receieved in parent", globalEvent);
		});
	});
</script>

<div
	class="flex justify-center items-center w-full h-[160px] bg-osvauld-frameblack text-osvauld-quarzowhite text-lg font-light"
>
	{success ? "Success!" : "failure"}
</div>
