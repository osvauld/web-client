<script>
	import { invoke } from "@tauri-apps/api/core";
	import { setLocale } from "../i18n/i18n-svelte";
	import { loadLocaleAsync } from "../i18n/i18n-util.async";
	import { onMount } from "svelte";

	import DefaultLayout from "../lib/components/mobile/components/layouts/DefaultLayout.svelte";
	import CredentialLayout from "../lib/components/mobile/components/layouts/CredentialLayout.svelte";
	import CategoryLayout from "../lib/components/mobile/components/layouts/CategoryLayout.svelte";
	import { uiState } from "../lib/components/mobile/store/mobile.ui.store";

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

	$: currentLayout = $uiState.selectedCredentialType
		? "credential"
		: $uiState.selectedCredentialType
			? "category"
			: "default";

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

{#key currentLayout}
	{#if currentLayout === "credential"}
		<CredentialLayout />
	{:else if currentLayout === "category"}
		<CategoryLayout />
	{:else}
		<DefaultLayout />
	{/if}
{/key}
