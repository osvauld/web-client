<script lang="ts">
	import { slide } from "svelte/transition";
	import Add from "../../../icons/add.svelte";
	import RoundedInfo from "../../../icons/roundedInfo.svelte";
	import RightArrow from "../../../icons/rightArrow.svelte";
	import {
		vaultSwitchActive,
		currentVault,
		vaults,
		bottomNavActive,
	} from "../../store/mobile.ui.store";
	import { onMount } from "svelte";
	import { sendMessage } from "../../../lib/components/dashboard/helper";

	let newVaultInputActive = false;
	let newVaultName = "";

	const autofocus = (node) => {
		node.focus();
	};

	const handleFolderCreation = async () => {
		await sendMessage("addFolder", {
			name: newVaultName,
			description: "",
		});
		bottomNavActive.set(true);
		// todo: change this to the newly created vault (be)
		currentVault.set(newVaultName);
		vaultSwitchActive.set(false);
		newVaultName = "";
		newVaultInputActive = false;
	};

	const selectVault = (vault) => {
		vaultSwitchActive.set(false);
		newVaultInputActive = false;
		currentVault.set(vault);
		bottomNavActive.set(true);
	};

	onMount(async () => {
		try {
			console.log("Vault manager mounted");
			const resp = await sendMessage("getFolder");
			const updatedVaults = [{ id: "all", name: "All Vaults" }, ...resp];
			vaults.set(updatedVaults);
		} catch (e) {
			console.log("Error received ===>", e);
		}
	});
</script>

<div
	class="absolute w-full h-auto bottom-0 border-t-[1px] border-mobile-textSecondary bg-mobile-bgPrimary rounded-t-2xl px-2 pt-2 pb-16 flex flex-col gap-2 text-lg"
	in:slide
	out:slide>
	{#each $vaults as vault (vault.id)}
		{@const isActive = $currentVault.name === vault.name}
		<button
			on:click="{() => selectVault(vault)}"
			class="h-[48px] p-4 text-mobile-textPrimary flex items-center rounded-lg"
			class:bg-mobile-bgLight="{isActive}"
			class:text-mobile-textTertiary="{isActive}">
			<span><RoundedInfo color="{isActive ? '#F2F2F0' : '#85889C'}" /></span>
			<span class="grow text-left pl-2 capitalize">{vault.name}</span>
			<span><RightArrow color="{isActive ? '#F2F2F0' : '#85889C'}" /></span>
		</button>
	{/each}

	{#if newVaultInputActive}
		<form
			class="h-[250px] rounded-[20px] border border-mobile-bgLight px-3 pt-3 pb-4 text-mobile-textPrimary flex flex-col gap-3"
			on:submit|preventDefault="{handleFolderCreation}"
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
					>Create New Vault <Add color="#000" /></button>
			</div>
		</form>
	{:else}
		<button
			type="submit"
			on:click="{() => (newVaultInputActive = true)}"
			class="h-[48px] flex justify-center items-center gap-1 rounded-lg border-2 border-mobile-bgHighlight p-4 active:bg-mobile-bgLight text-mobile-textActive"
			>Create New Vault <Add color="#85889C" /></button>
	{/if}
</div>
