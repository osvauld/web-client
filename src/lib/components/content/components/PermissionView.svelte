<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";

	const dispatch = createEventDispatcher();

	let eventGlobal;
	let usernameContent = "empty";

	onMount(async () => {
		window.addEventListener("message", (event) => {
			if (event.data.id !== "osvauld") {
				return;
			}
			const { username } = event.data;
			usernameContent = username;
			eventGlobal = event;
		});
	});

	const handleUserInput = (input) => {
		dispatch("save", input);
		eventGlobal.source.postMessage({ success: input }, eventGlobal.origin);
	};
</script>

<p class="mt-4 mb-3">Would you like to add this credential to osvauld?</p>
<span class="flex gap-2 text-sm items-center mb-3"
	>Username: <p>{usernameContent}</p></span
>
<span class="flex gap-2 text-sm items-center"
	>Password: <p class="flex items-center">***********</p></span
>
<div class="flex justify-between items-center mt-6">
	<button
		on:click="{() => handleUserInput(false)}"
		class="px-2 py-1 bg-red-600 flex justify-center items-center">Later</button
	>
	<button
		class="px-2 py-1 bg-green-600 flex justify-center items-center"
		on:click="{() => handleUserInput(true)}">Save</button
	>
</div>
