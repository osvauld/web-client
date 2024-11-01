<script>
	import { invoke } from "@tauri-apps/api/core";
	import { setLocale } from "../i18n/i18n-svelte";
	import { loadLocaleAsync } from "../i18n/i18n-util.async";
	import { onMount } from "svelte";

	import LocationSearchFilter from "../lib/components/mobile/components/LocationSearchFilter.svelte";
	import MainNav from "../lib/components/mobile/components/MainNav.svelte";
	import RecentsList from "../lib/components/mobile/components/RecentsList.svelte";
	import Categories from "../lib/components/mobile/components/Categories.svelte";
	import VaultList from "../lib/components/mobile/components/VaultList.svelte";

	let isRecentsVisible = true;
	const supportedLanguages = [
		"en",
		"de",
		"ar",
		"fr",
		"hi",
		"it",
		"ja",
		"ko",
		"nl",
		"pl",
		"ru",
		"tr",
		"zh",
	];
	let currentVault = "all";

	async function initializeLanguage() {
		try {
			const locale = await invoke("get_system_locale");
			const deviceLanguage = String(locale).split(/[-_]/)[0].toLowerCase();
			console.log("Device langige detected as", deviceLanguage);
			const languageToUse = supportedLanguages.includes(deviceLanguage)
				? deviceLanguage
				: "en";
			// const languageToUse = "ko";
			await loadLocaleAsync(languageToUse);
			setLocale(languageToUse);
		} catch (error) {
			console.error("Error detecting system language:", error);
			await loadLocaleAsync("en");
			setLocale("en");
		}
	}

	onMount(() => {
		initializeLanguage();
	});
</script>

<main
	class="w-screen h-screen bg-mobile-bgPrimary flex flex-col relative pt-[48px] pb-[60px] overflow-hidden">
	<LocationSearchFilter {currentVault} />
	<VaultList bind:currentVault />
	<RecentsList bind:isRecentsVisible />
	<Categories {isRecentsVisible} />
	<MainNav bind:currentVault />
</main>
