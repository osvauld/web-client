<script lang="ts">
	import { ModifiedEvent } from "../../../dtos/event.dto";

	export let iframeCustomEvent: ModifiedEvent;
	export let value: boolean = false;

	let usernameContent: string = "empty";

	$: if (iframeCustomEvent) {
		const { username } = iframeCustomEvent.data;
		usernameContent = username;
	}

	const handleUserInput = (input: boolean) => {
		value = input;
		if (!input) {
			(iframeCustomEvent.source as Window).postMessage(
				{ unmount: true },
				iframeCustomEvent.origin as string,
			);
		}
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
