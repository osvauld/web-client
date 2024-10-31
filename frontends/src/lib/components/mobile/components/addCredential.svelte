<script>
	import MobileDownArrow from "../../basic/icons/mobileDownArrow.svelte";
	import { CATEGORIES, credentialFieldsUpdater } from "../helper";

	export let selectedCredentialType;

	let selectedCategory = CATEGORIES.find(
		(item) => item.id === selectedCredentialType,
	);
</script>

<nav
	class="w-full h-[48px] pr-3 flex justify-start items-center gap-1 flex-shrink-0">
	<button on:click="{() => (selectedCredentialType = '')}" class="p-2 pr-1">
		<span class="inline-block rotate-90">
			<MobileDownArrow />
		</span>
	</button>
	<svelte:component this="{selectedCategory.icon}" color="#85889C" />
	<h1 class="text-mobile-textPrimary text-2xl font-medium">
		{selectedCategory?.name}
	</h1>
</nav>

<div class="grow p-4 text-mobile-textPrimary">
	<span>Enter your {selectedCategory?.name} details</span>
</div>

<div
	class="h-[68px] flex-shrink-0 p-3 flex justify-between items-center text-mobile-bgPrimary">
	<button
		class="px-10 py-2.5 text-mobile-textSecondary"
		on:click="{() => (selectedCredentialType = '')}">Cancel</button>
	<button class="px-10 py-2.5 bg-osvauld-carolinablue rounded-lg font-medium"
		>Add Card</button>
</div>
