<script lang="ts">
	import { GroupIcon, UserIcon } from "./icons";

	import { createEventDispatcher } from "svelte";

	export let tabs = ["Groups", "Users"];
	const dispatch = createEventDispatcher();

	let selectedItem = tabs[0];
	const select = (item) => {
		selectedItem = item;
		dispatch("select", item);
	};
</script>

<div class="flex my-2 w-full justify-center items-center">
	<div
		class="inline-flex w-full justify-center space-x-1 p-0.5 bg-osvauld-frameblack border border-osvauld-iconblack rounded-xl font-normal text-sm"
	>
		{#each tabs as item}
			<button
				class="w-1/2 px-6 py-1.5 flex justify-center items-center rounded-lg focus:outline-none transition-colors duration-75 ease-in {selectedItem ===
				item
					? 'bg-osvauld-sideListHighlight text-osvauld-plainwhite'
					: 'text-osvauld-quarzowhite'} "
				on:click="{() => select(item)}"
			>
				{#if item === "Groups"}
					<span class="scale-100">
						<GroupIcon
							color="{selectedItem === 'Groups' ? 'white' : '#85889C'}"
						/>
					</span>
				{:else}
					<span class="scale-[0.80]">
						<UserIcon
							color="{selectedItem === 'Users' ? 'white' : '#85889C'}"
						/>
					</span>
				{/if}
				<span class="{item === 'Groups' ? 'ml-2' : 'ml-0'}">{item}</span>
			</button>
		{/each}
	</div>
</div>
