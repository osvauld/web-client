<script>
	import { slide } from "svelte/transition";
	import Add from "../../../../icons/add.svelte";

	const VAULTS = [
		{ id: "all", name: "All Vaults", count: 54 },
		{ id: "personal", name: "Personal", count: 4 },
		{ id: "work", name: "Work", count: 50 },
	];
	export let vaultSwitchActive;
</script>

{#if vaultSwitchActive}
	<div
		class="absolute w-full h-auto bottom-0 border-t-[1px] border-mobile-textSecondary bg-mobile-bgPrimary rounded-t-2xl px-2 pt-5 pb-6 flex flex-col gap-2 text-lg"
		in:slide
		out:slide>
		{#each VAULTS as vault (vault.id)}
			<button
				on:click="{() => (vaultSwitchActive = false)}"
				class="h-[48px] p-4 active:bg-mobile-bgLight text-mobile-textPrimary"
				>{vault.name}</button>
		{/each}
		<button
			on:click="{() => (vaultSwitchActive = false)}"
			class="h-[48px] flex justify-center items-center gap-1 rounded-lg border-2 border-mobile-bgHighlight p-4 active:bg-mobile-bgLight text-mobile-textPrimary"
			>Create New Vault <Add color="#85889C" /></button>
	</div>
{/if}
