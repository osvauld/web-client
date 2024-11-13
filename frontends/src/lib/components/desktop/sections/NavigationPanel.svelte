<script>
	import Arrow from "../.../../../../../icons/rightArrow.svelte";
	import Folder from "../.../../../../../icons/folderIcon.svelte";
	import { createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher();

	export let activeSection = "home";

	function handleSectionChange(section) {
		activeSection = section;
		dispatch("sectionChange", { section });
	}
</script>

<nav class="w-[360px] py-10 px-4" aria-label="Main Navigation">
	<button
		class="w-full text-[26px] text-osvauld-fieldText font-medium leading-6 bg-osvauld-frameblack rounded-xl border border-osvauld-defaultBorder p-4 flex justify-between items-center mb-[20px]"
		aria-label="Switch Vault"
		aria-controls="vaultSelector"
		aria-expanded="false"
		>All Vaults <span class="rotate-90"
			><Arrow color="#F2F2F0" size="24" /></span
		></button>
	<div class="border-y border-osvauld-borderColor flex flex-col my-6">
		<ul class="space-y-1" role="list">
			<li>
				<button
					class="w-full flex items-center gap-3 p-3 rounded-lg
                       transition-colors
                       {activeSection !== 'home'
						? 'text-osvauld-fieldText'
						: ''}"
					on:click="{() => handleSectionChange('home')}"
					aria-current="{activeSection === 'home' ? 'page' : undefined}">
					<Folder aria-hidden="true" />
					<span>Home</span>
				</button>
			</li>
			<li>
				<button
					class="w-full flex items-center gap-3 p-3 rounded-lg
                       {activeSection !== 'favourites'
						? 'text-osvauld-fieldText'
						: ''}"
					on:click="{() => handleSectionChange('favourites')}"
					aria-current="{activeSection === 'favourites' ? 'page' : undefined}">
					<Folder aria-hidden="true" />
					<span>Favourites</span>
				</button>
			</li>
		</ul>
	</div>
</nav>
