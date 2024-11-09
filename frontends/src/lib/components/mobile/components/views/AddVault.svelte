<script>
	import { slide } from "svelte/transition";
	import Add from "../../../../../icons/add.svelte";
	import RoundedInfo from "../../../../../icons/roundedInfo.svelte";
	import RightArrow from "../../../../../icons/rightArrow.svelte";
	import { vaultSwitchActive, currentVault } from "../../store/mobile.ui.store";

	const VAULTS = [
		{ id: "all", name: "All Vaults", count: 54 },
		{ id: "personal", name: "Personal", count: 4 },
		{ id: "work", name: "Work", count: 50 },
	];
	let newVaultInputActive = false;
	let newVaultName = "";

	const autofocus = (node) => {
		node.focus();
	};
</script>

{#if $vaultSwitchActive}
	<div
		class="absolute w-full h-auto bottom-0 border-t-[1px] border-mobile-textSecondary bg-mobile-bgPrimary rounded-t-2xl px-2 pt-2 pb-3 flex flex-col gap-2 text-lg"
		in:slide
		out:slide>
		{#each VAULTS as vault (vault.id)}
			{@const isActive = $currentVault === vault.id}
			<button
				on:click="{() => {
					vaultSwitchActive.set(false);
					newVaultInputActive = false;
					currentVault.set(vault.id);
				}}"
				class="h-[48px] p-4 text-mobile-textPrimary flex items-center rounded-lg"
				class:bg-mobile-bgLight="{isActive}"
				class:text-mobile-textTertiary="{isActive}">
				<span><RoundedInfo color="{isActive ? '#F2F2F0' : '#85889C'}" /></span>
				<span class="grow text-left pl-2">{vault.name}</span>
				<span><RightArrow color="{isActive ? '#F2F2F0' : '#85889C'}" /></span>
			</button>
		{/each}

		{#if newVaultInputActive}
			<div
				class="h-[250px] rounded-[20px] border border-mobile-bgLight px-3 pt-3 pb-4 text-mobile-textPrimary flex flex-col gap-3"
				in:slide
				out:slide>
				<span class="text-lg text-center">New Vault</span>
				<hr class="h-px border-0 bg-mobile-bgLight" />
				<div class="flex flex-col grow gap-1">
					<label for="new-vault-name" class="text-sm">Add a title</label>
					<input
						type="text"
						id="new-vault-name"
						class="bg-mobile-bgSeconary border-0 outline-0 focus:ring-0 rounded-lg"
						use:autofocus
						bind:value="{newVaultName}" />
					<button
						type="submit"
						class="h-[48px] flex justify-center items-center gap-1 rounded-lg bg-mobile-highlightBlue text-mobile-bgPrimary font-medium text-lg mt-6"
						on:click="{() => vaultSwitchActive.set(false)}"
						>Create New Vault <Add color="#000" /></button>
				</div>
			</div>
		{:else}
			<button
				on:click="{() => (newVaultInputActive = true)}"
				class="h-[48px] flex justify-center items-center gap-1 rounded-lg border-2 border-mobile-bgHighlight p-4 active:bg-mobile-bgLight text-mobile-textActive"
				>Create New Vault <Add color="#85889C" /></button>
		{/if}
	</div>
{/if}
