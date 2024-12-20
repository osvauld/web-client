<script>
	import { fly } from "svelte/transition";
	import MobileHome from "../../../icons/mobileHome.svelte";
	import { vaults, currentVault } from "../store/desktop.ui.store";
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	const handleVaultSelection = (vault) => {
		dispatch("select", vault);
	};
</script>

<div
	class="absolute w-full h-auto border border-osvauld-iconblack bg-osvauld-frameblack rounded-2xl px-2 pt-2 pb-3 flex flex-col gap-2 text-lg"
	style="top: calc(100% + 10px)"
	id="vaultSelector"
	in:fly>
	{#each $vaults.filter((vault) => vault.id !== "all") as vault (vault.id)}
		{@const isActive = $currentVault.id === vault.id}
		<button
			class="h-[48px] p-4 text-mobile-textPrimary flex items-center rounded-lg hover:bg-osvauld-frameblack"
			class:bg-mobile-bgLight="{isActive}"
			class:text-mobile-textTertiary="{isActive}"
			on:click|stopPropagation="{() => handleVaultSelection(vault)}">
			<span><MobileHome color="{isActive ? '#F2F2F0' : '#85889C'}" /></span>
			<span class="grow text-left pl-2 capitalize max-w-full truncate"
				>{vault.name}</span>
		</button>
	{/each}
</div>
