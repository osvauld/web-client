<script lang="ts">
	import LocationSearchFilter from "../sections/LocationSearchFilter.svelte";
	import MainNav from "../sections/MainNav.svelte";
	import RecentsList from "../views/RecentsList.svelte";
	import AddVault from "../views/AddVault.svelte";
</script>

<main
	class="w-screen h-screen bg-mobile-bgPrimary flex flex-col relative pt-[48px] pb-[60px] overflow-hidden">
	<LocationSearchFilter />
	<RecentsList />
	<MainNav />
	<AddVault />
</main>
