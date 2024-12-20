<script>
	import Arrow from "../../../icons/rightArrow.svelte";
	import Home from "../../../icons/mobileHome.svelte";
	import Star from "../../../icons/star.svelte";
	import { createEventDispatcher } from "svelte";
	import VaultManager from "../views/VaultManager.svelte";
	const dispatch = createEventDispatcher();
	import {
		currentVault,
		credentialListWithType,
	} from "../store/desktop.ui.store";
	import { CATEGORIES } from "../../utils/credentialUtils";

	let selectedSection = "home";
	let selectedCategory = "";
	let vaultSwitchActive = false;

	const handleSectionChange = (section) => {
		// currentView.set(section);
		selectedCategory = "";
		selectedSection = section;
	};

	const handleCategoryFilter = (type, id) => {
		selectedSection = "";
		selectedCategory = id;
		credentialListWithType.set(type);
	};
</script>

<nav
	class="w-[360px] py-10 px-4 whitespace-nowrap"
	aria-label="Main Navigation">
	<div class=" relative">
		<button
			class="w-full text-[26px] text-osvauld-fieldText font-medium leading-6 bg-osvauld-frameblack rounded-xl border border-osvauld-defaultBorder px-4 py-3 flex justify-between items-center capitalize"
			aria-label="Switch Vault"
			aria-controls="vaultSelector"
			aria-expanded="false"
			on:click="{() => (vaultSwitchActive = !vaultSwitchActive)}"
			>{$currentVault.name}<span
				class="transition-transform duration-300 {vaultSwitchActive
					? '-rotate-90'
					: 'rotate-90'}"><Arrow color="#F2F2F0" size="24" /></span
			></button>
		{#if vaultSwitchActive}
			<VaultManager bind:vaultSwitchActive />
		{/if}
	</div>
	<div
		class="border-y border-osvauld-borderColor text-osvauld-fieldText flex flex-col my-6 py-1 gap-1">
		<ul class="space-y-1 font-light text-base text-" role="list">
			<li>
				<button
					class="w-full flex items-center gap-3 p-3 rounded-lg
                       transition-colors
                       {selectedSection === 'home'
						? 'text-osvauld-sideListTextActive bg-osvauld-fieldActive'
						: ''}"
					on:click="{() => handleSectionChange('home')}"
					aria-current="{selectedSection === 'home' ? 'page' : undefined}">
					<Home color="{selectedSection === 'home' ? '#F2F2F0' : '#85889C'}" />
					<span>Home</span>
				</button>
			</li>
			<li>
				<button
					class="w-full flex items-center gap-3 p-3 rounded-lg
                       {selectedSection === 'favourites'
						? 'text-osvauld-sideListTextActive bg-osvauld-fieldActive'
						: ''}"
					on:click="{() => handleSectionChange('favourites')}"
					aria-current="{selectedSection === 'favourites'
						? 'page'
						: undefined}">
					<Star
						color="{selectedSection === 'favourites'
							? '#F2F2F0'
							: '#85889C'}" />
					<span>Favourites</span>
				</button>
			</li>
		</ul>
	</div>
	<ul class="font-light text-base space-y-1 text-osvauld-fieldText" role="list">
		{#each CATEGORIES as category}
			<li>
				<button
					class="w-full flex items-center gap-3 p-3 rounded-lg
                       transition-colors
						  {selectedCategory === category.id
						? 'text-osvauld-sideListTextActive bg-osvauld-fieldActive'
						: ''}"
					on:click="{() => handleCategoryFilter(category.type, category.id)}"
					aria-current="{selectedCategory === category.id
						? 'page'
						: undefined}">
					<svelte:component
						this="{category.icon}"
						color="{selectedCategory === category.id
							? '#F2F2F0'
							: '#85889C'}" />
					<span>{category.type}</span>
				</button>
			</li>
		{/each}
	</ul>
</nav>
