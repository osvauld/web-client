<script lang="ts">
	import { slide, fly, blur } from "svelte/transition";
	import Add from "../../../icons/add.svelte";
	import MobileHome from "../../../icons/mobileHome.svelte";
	import { onMount, onDestroy } from "svelte";
	import { sendMessage } from "../../../lib/components/dashboard/helper";
	import { vaults, currentVault } from "../store/desktop.ui.store";

	export let vaultSwitchActive;
	let newVaultInputActive = false;
	let newVaultName = "";

	const autofocus = (node) => {
		node.focus();
	};

	const handleVaultCreation = async (newVaultName) => {
		try {
			await sendMessage("addFolder", {
				name: newVaultName,
				description: "",
			});
		} catch (e) {
			console.log("Vault creation failed");
		}
		currentVault.set(newVaultName);
		vaultSwitchActive = false;
		newVaultName = "";
	};

	const handleVaultSwitch = (vault) => {
		currentVault.set(vault);
		vaultSwitchActive = false;
	};

	onMount(async () => {
		try {
			const resp = await sendMessage("getFolder");
			const updatedVaults = [{ id: "all", name: "All Vaults" }, ...resp];
			vaults.set(updatedVaults);
		} catch (e) {
			console.log("Error received ===>", e);
		}
	});
</script>

<div
	class="absolute w-full h-auto border border-osvauld-iconblack bg-mobile-bgPrimary rounded-2xl px-2 pt-2 pb-3 flex flex-col gap-2 text-lg"
	style="top: calc(100% + 10px)"
	id="vaultSelector"
	in:fly>
	{#each $vaults as vault (vault.id)}
		{@const isActive = $currentVault.id === vault.id}
		<button
			class="h-[48px] p-4 text-mobile-textPrimary flex items-center rounded-lg hover:bg-osvauld-frameblack"
			class:bg-mobile-bgLight="{isActive}"
			class:text-mobile-textTertiary="{isActive}"
			on:click="{() => handleVaultSwitch(vault)}">
			<span><MobileHome color="{isActive ? '#F2F2F0' : '#85889C'}" /></span>
			<span class="grow text-left pl-2 capitalize">{vault.name}</span>
		</button>
	{/each}

	{#if newVaultInputActive}
		<form
			class="h-[250px] rounded-[20px] border border-mobile-bgLight px-3 pt-3 pb-4 text-mobile-textPrimary flex flex-col gap-3"
			in:slide
			out:slide
			on:submit|preventDefault="{() => handleVaultCreation(newVaultName)}">
			<span class="text-lg text-center">New Vault</span>
			<hr class="h-px border-0 bg-mobile-bgLight" />
			<div class="flex flex-col grow gap-1">
				<label for="new-vault-name" class="text-sm">Add a title</label>
				<input
					type="text"
					id="new-vault-name"
					class="bg-mobile-bgSeconary border-0 outline-0 focus:ring-0 rounded-lg"
					autocomplete="off"
					use:autofocus
					bind:value="{newVaultName}" />
				<button
					type="submit"
					class="h-[48px] flex justify-center items-center gap-1 rounded-lg bg-mobile-highlightBlue text-mobile-bgPrimary font-medium text-lg mt-6"
					>Create New Vault <Add color="#000" /></button>
			</div>
		</form>
	{:else}
		<button
			on:click="{() => (newVaultInputActive = true)}"
			class="h-[48px] flex justify-center items-center gap-1 rounded-lg border-2 border-mobile-bgHighlight p-4 active:bg-mobile-bgLight text-mobile-textActive"
			>Create New Vault <Add color="#85889C" /></button>
	{/if}
</div>
