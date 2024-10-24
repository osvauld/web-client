<script>
	import LocationSearchFilter from "./components/mobile/components/LocationSearchFilter.svelte";
	import MainNav from "./components/mobile/components/MainNav.svelte";
	import RecentsList from "./components/mobile/components/RecentsList.svelte";
	import Categories from "./components/mobile/components/Categories.svelte";
	import VaultList from "./components/mobile/components/VaultList.svelte";

	let isRecentsVisible = true;

	let currentVault = "All";
</script>

<main
	class="w-screen h-screen bg-mobile-bgPrimary text-white flex flex-col relative pt-[48px] pb-[60px] overflow-hidden">
	<LocationSearchFilter {currentVault} />
	<VaultList bind:currentVault />
	<RecentsList bind:isRecentsVisible />
	<Categories {isRecentsVisible} />
	<MainNav />
</main>
