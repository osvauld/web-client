<script>
	import { invoke } from "@tauri-apps/api/core";
	import { setLocale } from "../i18n/i18n-svelte";
	import { loadLocaleAsync } from "../i18n/i18n-util.async";
	import { onMount } from "svelte";

	import LocationSearchFilter from "./components/mobile/components/LocationSearchFilter.svelte";
	import MainNav from "./components/mobile/components/MainNav.svelte";
	import RecentsList from "./components/mobile/components/RecentsList.svelte";
	import Categories from "./components/mobile/components/Categories.svelte";
	import VaultList from "./components/mobile/components/VaultList.svelte";
	import AddCredential from "./components/mobile/components/addCredential.svelte";

	const SUPPORTED_LANGUAGES = [
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

	// Need to indic languages

	let currentVault = "all";
	let isRecentsVisible = true;
	let selectedCredentialType = "";
	let selectedTheme = "one";

	async function initializeLanguage() {
		try {
			const locale = await invoke("get_system_locale");
			const deviceLanguage = String(locale).split(/[-_]/)[0].toLowerCase();
			// const languageToUse = SUPPORTED_LANGUAGES.includes(deviceLanguage)

			// 	? deviceLanguage
			// 	: "en";
			const languageToUse = "en";
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

{#if selectedCredentialType}
	<main
		class="w-screen h-screen bg-mobile-bgPrimary flex flex-col overflow-hidden p-3">
		<AddCredential bind:selectedCredentialType />
	</main>
{:else}
	<main
		class="w-screen h-screen bg-mobile-bgPrimary flex flex-col relative pt-[48px] pb-[60px] overflow-hidden">
		<LocationSearchFilter {currentVault} bind:selectedTheme />
		<VaultList bind:currentVault {selectedTheme} />
		<RecentsList bind:isRecentsVisible {selectedTheme} />
		<Categories
			bind:selectedCredentialType
			{isRecentsVisible}
			{selectedTheme} />
		<MainNav bind:currentVault {selectedTheme} />
	</main>
{/if}
