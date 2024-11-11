<script lang="ts">
	import TopNavBar from "../sections/TopNavBar.svelte";
	import BottomNavigation from "../sections/BottomNavigation.svelte";
	import RecentsList from "../views/RecentsList.svelte";
	import AddVault from "../views/AddVault.svelte";
	import EmptyVault from "../ui/EmptyVault.svelte";
	import { vaultSwitchActive } from "../../store/mobile.ui.store";

	const NUM_CREDS = 0;
</script>

<main
	class="w-screen h-screen bg-mobile-bgPrimary flex flex-col relative pt-[48px] pb-[60px] overflow-hidden">
	<TopNavBar />
	{#if NUM_CREDS === 0}
		<EmptyVault />
	{:else}
		<RecentsList {NUM_CREDS} />
	{/if}
	<BottomNavigation />
	{#if $vaultSwitchActive}
		<AddVault />
	{/if}
</main>
