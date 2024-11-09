<script lang="ts">
	import TopNavBar from "../sections/TopNavBar.svelte";
	import BottomNavigation from "../sections/BottomNavigation.svelte";
	import RecentsList from "../views/RecentsList.svelte";
	import AddVault from "../views/AddVault.svelte";
</script>

<main
	class="w-screen h-screen bg-mobile-bgPrimary flex flex-col relative pt-[48px] pb-[60px] overflow-hidden">
	<TopNavBar />
	<RecentsList />
	<BottomNavigation />
	<AddVault />
</main>
