<script lang="ts">
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();
	let selectedItem = "user";

	const select = async (choice: string) => {
		selectedItem = choice;
		dispatch("select", selectedItem);
	};
</script>

<div class="flex justify-center w-[100%]">
	<div
		class="inline-flex justify-center space-x-1 p-1 bg-osvauld-frameblack border border-osvauld-iconblack rounded-xl w-[70%]"
	>
		{#each ["user", "admin"] as item}
			<button
				class="w-1/2 px-4 py-1 text-lg flex justify-center items-center rounded-lg focus:outline-none {selectedItem ===
				item
					? 'bg-osvauld-bordergreen text-osvauld-plainwhite'
					: 'text-osvauld-quarzowhite'} "
				on:click="{() => select(item)}"
			>
				<span class="">{item}</span>
			</button>
		{/each}
	</div>
</div>
