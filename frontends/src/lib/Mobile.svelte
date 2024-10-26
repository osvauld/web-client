<script>
	import LocationSearchFilter from "./components/mobile/components/LocationSearchFilter.svelte";
	import MainNav from "./components/mobile/components/MainNav.svelte";
	import RecentsList from "./components/mobile/components/RecentsList.svelte";
	import Categories from "./components/mobile/components/Categories.svelte";
	import VaultList from "./components/mobile/components/VaultList.svelte";

	let isRecentsVisible = true;
	import { setLocale } from "../i18n/i18n-svelte";
	import { loadLocaleAsync } from "../i18n/i18n-util.async";
	import { onMount } from "svelte";
	onMount(async () => {
		await loadLocaleAsync("en");
		setLocale("en");
	});
	let currentVault = "All";
</script>

<main
	class="w-screen h-screen bg-mobile-bgPrimary flex flex-col relative pt-[48px] pb-[60px] overflow-hidden">
	<LocationSearchFilter {currentVault} />
	<VaultList bind:currentVault />
	<RecentsList bind:isRecentsVisible />
	<Categories {isRecentsVisible} />
	<MainNav bind:currentVault />
</main>
