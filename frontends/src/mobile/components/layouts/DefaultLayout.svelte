<script lang="ts">
	import TopNavBar from "../sections/TopNavBar.svelte";
	import RecentsList from "../views/RecentsList.svelte";
	import AddVault from "../views/AddVault.svelte";
	import EmptyVault from "../ui/EmptyVault.svelte";
	import { vaultSwitchActive } from "../../store/mobile.ui.store";

	const NUM_CREDS = 1;
	vaultSwitchActive.subscribe((value) => {
		console.log(value);
	});
</script>

<main
	class="w-screen h-screen bg-mobile-bgPrimary flex flex-col relative pt-[48px] pb-[60px] overflow-hidden">
	<TopNavBar />

	<RecentsList />

	{#if $vaultSwitchActive}
		<AddVault />
	{/if}
</main>
