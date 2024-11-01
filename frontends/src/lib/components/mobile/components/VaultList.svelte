<script>
	import Add from "../../../../icons/add.svelte";
	import LL from "../../../../i18n/i18n-svelte";
	export const location = "Home";
	export let currentVault;
	const VAULTS = [
		{ id: "all", name: "All", count: 54 },
		{ id: "personal", name: "Personal", count: 4 },
		{ id: "work", name: "Work", count: 50 },
	];
</script>

<div class="h-[56px] p-3 flex gap-2.5 text-mobile-textPrimary">
	{#each VAULTS as vault (vault.id)}
		<button
			class="bg-mobile-bgFade rounded-lg px-4 py-2.5 flex justify-center items-center whitespace-nowrap"
			class:bg-mobile-bgHighlight="{currentVault === vault.id}"
			on:click="{() => (currentVault = vault.id)}"
			>{$LL.nav[vault.id]()} ({vault.count})</button>
	{/each}
	<button
		class="bg-mobile-bgFade rounded-lg px-2.5 py-2.5 flex justify-center items-center"
		><Add color="#85889C" /></button>
</div>
