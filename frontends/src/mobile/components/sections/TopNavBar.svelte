<script lang="ts">
	import Lens from "../../../icons/lens.svelte";
	import Options from "../../../icons/options.svelte";
	import DownArrow from "../../../icons/mobileDownArrow.svelte";
	import LL from "../../../i18n/i18n-svelte";
	import {
		vaultSwitchActive,
		currentVault,
		bottomNavActive,
	} from "../../store/mobile.ui.store";

	const handleVaultSwitch = () => {
		if ($vaultSwitchActive) {
			bottomNavActive.set(true);
		}
		console.log($vaultSwitchActive, "tEST");
		vaultSwitchActive.set(!$vaultSwitchActive);
	};
</script>

<div class="fixed w-full top-0 h-[48px] flex justify-between items-center px-4">
	<span><Options color="#85889C" /></span>
	<button
		class="text-2xl text-mobile-textPrimary font-semibold flex items-center gap-2 capitalize"
		on:click="{handleVaultSwitch}">
		{$currentVault.id === "all" ? "All Vaults" : $currentVault.name}
		<span><DownArrow color="#85889C" /></span>
	</button>
	<span><Lens color="#85889C" size="24" /></span>
</div>
