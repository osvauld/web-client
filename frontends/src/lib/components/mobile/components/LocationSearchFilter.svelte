<script lang="ts">
	import Filter from "../../../../icons/filter.svelte";
	import Lens from "../../../../icons/lens.svelte";
	import Options from "../../../../icons/options.svelte";
	import LL from "../../../../i18n/i18n-svelte";
	export let currentVault: "all" | "personal" | "work" = "all";
</script>

<div class="fixed w-full top-0 h-[48px] flex justify-between items-center px-4">
	<div class="text-2xl text-mobile-textPrimary font-semibold">
		{currentVault === "all" ? $LL.nav.home() : $LL.nav[currentVault]()}
	</div>
	<div class="flex gap-4">
		<span><Lens color="#85889C" size="24" /></span>
		<span><Filter color="#85889C" /></span>
		<span><Options color="#85889C" /></span>
	</div>
</div>
