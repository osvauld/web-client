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
	import AddVault from "../lib/components/mobile/components/addVault.svelte";
	import AddCredential from "../lib/components/mobile/components/addCredentialMobile.svelte";

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
	let isRecentsVisible = true;
	let currentVault = "all";
	let vaultSwitchActive = false;
	let selectedCredentialType = "";

	async function initializeLanguage() {
		try {
			const locale = await invoke("get_system_locale");
			const deviceLanguage = String(locale).split(/[-_]/)[0].toLowerCase();
			const languageToUse = SUPPORTED_LANGUAGES.includes(deviceLanguage)
				? deviceLanguage
				: "en";
			// const languageToUse = "ar";
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
		<LocationSearchFilter {currentVault} />
		<VaultList bind:currentVault />
		<RecentsList bind:isRecentsVisible />
		<Categories bind:selectedCredentialType {isRecentsVisible} />
		<MainNav bind:currentVault />
		<AddVault bind:vaultSwitchActive bind:currentVault />
	</main>
{/if}
