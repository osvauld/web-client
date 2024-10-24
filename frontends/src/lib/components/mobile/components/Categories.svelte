<script>
	import DownArrow from "../../basic/icons/mobileDownArrow.svelte";
	import CreditCard from "../../basic/icons/creditCard.svelte";

	export let isRecentsVisible;
	let isCategoriesVisible = true;

	const categories = [
		{ id: "login", name: "Login", icon: null },
		{ id: "pin", name: "PIN", icon: null },
		{ id: "card", name: "Credit/Debit Card", icon: CreditCard },
		{ id: "note", name: "Note", icon: null },
		{ id: "contact", name: "Contact", icon: null },
		{ id: "bank", name: "Bank Account", icon: null },
		{ id: "wallet", name: "Digital Wallet", icon: null },
		{ id: "ssh", name: "SSH Key", icon: null },
		{ id: "api", name: "API Credential", icon: null },
		{ id: "database", name: "Database", icon: null },
	];

	const handleCategoryClick = (itemId) => {
		console.log("Item clicked", itemId);
	};
</script>

<style>
	.overflow-container {
		max-height: 300px;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.overflow-container::-webkit-scrollbar {
		width: 4px;
		background-color: #111218;
	}

	.overflow-container::-webkit-scrollbar-thumb {
		background-color: #20212b;
		border-radius: 2px;
	}
</style>

<button
	class="px-3 h-[40px] flex justify-between items-center w-full active:bg-mobile-bgHighlight/10"
	aria-expanded="{isCategoriesVisible}"
	on:click="{() => (isCategoriesVisible = !isCategoriesVisible)}">
	<span class="text-mobile-textSecondary">Categories</span>
	<span
		class="transition-transform duration-200"
		style="transform: rotate({isCategoriesVisible ? 0 : -90}deg)">
		<DownArrow />
	</span>
</button>

{#if isCategoriesVisible}
	<div
		class="text-base grid grid-cols-2 gap-3 px-1 mx-2 text-mobile-textPrimary"
		class:overflow-container="{isRecentsVisible}">
		{#each categories as category (category.id)}
			<button
				class="relative border border-mobile-bgHighlight bg-mobile-bgSeconary rounded-lg px-3 py-2.5 h-[90px]
               active:bg-mobile-bgHighlight/10 transition-colors touch-manipulation"
				on:click="{() => handleCategoryClick(category.id)}">
				<div class="flex flex-col h-full items-center justify-center gap-2">
					{#if category.icon}
						<span class="flex justify-center items-center">
							<svelte:component this="{category.icon}" color="#85889C" />
						</span>
					{/if}
					<span class="text-center text-sm leading-tight">{category.name}</span>
				</div>
			</button>
		{/each}
	</div>
{/if}
