<script lang="ts">
	import { addCredentialModal, currentVault } from "../store/desktop.ui.store";
	import ClosePanel from "../../../icons/closePanel.svelte";
	import RightArrow from "../../../icons/rightArrow.svelte";
	import VaultSelector from "../ui/VaultSelector.svelte";

	let vaultSwitchActive = false;
	let selectedVault;

	const handleVaultSelection = (e) => {
		vaultSwitchActive = false;
		selectedVault = e.detail;
	};
</script>

<div
	class="fixed inset-0 z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[0.5px] flex justify-center items-center"
	on:click|preventDefault="{() => addCredentialModal.set(false)}">
	<div
		class="w-[49.5rem] h-[35.3rem] bg-osvauld-frameblack rounded-3xl border border-osvauld-activeBorder p-10">
		<div
			class="flex justify-between items-center text-osvauld-sideListTextActive text-3xl">
			<span>Add Credential to Osvauld</span><button
				on:click="{() => addCredentialModal.set(false)}"
				><ClosePanel size="{24}" /></button>
		</div>
		<hr
			class=" border-t border-osvauld-defaultBorder w-[calc(100%+5rem)] -translate-x-10 my-5" />

		{#if $currentVault.id === "all"}
			<div class="relative">
				<button
					class="w-full text-[26px] text-osvauld-fieldText font-medium leading-6 bg-osvauld-frameblack rounded-xl border border-osvauld-defaultBorder px-4 py-3 flex justify-between items-center capitalize"
					aria-label="Switch Vault"
					aria-controls="vaultSelector"
					aria-expanded="false"
					on:click|stopPropagation="{() =>
						(vaultSwitchActive = !vaultSwitchActive)}"
					>{selectedVault?.id ? selectedVault.name : "Select Vault"}<span
						class="transition-transform duration-300 {vaultSwitchActive
							? '-rotate-90'
							: 'rotate-90'}"><RightArrow color="#F2F2F0" /></span
					></button>
				{#if vaultSwitchActive}
					<VaultSelector on:select="{handleVaultSelection}" />
				{/if}
			</div>
		{/if}
	</div>
</div>
