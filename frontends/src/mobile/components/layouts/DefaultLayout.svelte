<script lang="ts">
	import { onMount } from "svelte";
	import { sendMessage } from "../../../lib/components/dashboard/helper";
	import TopNavBar from "../sections/TopNavBar.svelte";
	import RecentsList from "../views/RecentsList.svelte";
	import VaultManager from "../views/VaultManager.svelte";
	import EmptyVault from "../ui/EmptyVault.svelte";
	import { vaultSwitchActive, vaults } from "../../store/mobile.ui.store";

	const NUM_CREDS = 1;
	// vaultSwitchActive.subscribe((value) => {
	// 	console.log(value);
	// });

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

<main
	class="w-screen h-screen bg-mobile-bgPrimary flex flex-col relative pt-[48px] pb-[60px] overflow-hidden">
	<TopNavBar />
	<RecentsList />
	{#if $vaultSwitchActive}
		<VaultManager />
	{/if}
</main>
