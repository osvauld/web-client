<script lang="ts">
	import Filter from "../../../../icons/filter.svelte";
	import Lens from "../../../../icons/lens.svelte";
	import Options from "../../../../icons/options.svelte";
	import LL from "../../../../i18n/i18n-svelte";
	import { THEMES } from "../utils/helper";
	export let currentVault: "all" | "personal" | "work" = "all";
	export let selectedTheme;
</script>

<div class="fixed w-full top-0 h-[48px] flex justify-between items-center px-4">
	<div class="text-2xl text-mobile-textPrimary font-semibold">
		{currentVault === "all" ? $LL.nav.home() : $LL.nav[currentVault]()}
	</div>

	<select
		name="theme"
		id="theme"
		class="bg-mobile-bgPrimary text-mobile-bgHighlight border-y-sky-100"
		bind:value="{selectedTheme}">
		<option value="one">one</option>
		<option value="two">two</option>
		<option value="three">three</option>
	</select>
	<div class="flex gap-4">
		<span><Lens color="{THEMES[selectedTheme]}" size="24" /></span>
		<span><Filter color="{THEMES[selectedTheme]}" /></span>
		<span><Options color="{THEMES[selectedTheme]}" /></span>
	</div>
</div>
