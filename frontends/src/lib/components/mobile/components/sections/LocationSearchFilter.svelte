<script lang="ts">
	import Lens from "../../../../../icons/lens.svelte";
	import Options from "../../../../../icons/options.svelte";
	import DownArrow from "../../../../../icons/mobileDownArrow.svelte";
	import LL from "../../../../../i18n/i18n-svelte";
	import { uiState, uiStateActions } from "../../store/mobile.ui.store";
</script>

<div class="fixed w-full top-0 h-[48px] flex justify-between items-center px-4">
	<span><Options color="#85889C" /></span>
	<button
		class="text-2xl text-mobile-textPrimary font-semibold flex items-center gap-2"
		on:click="{() =>
			uiStateActions.setVaultSwitchActive(!$uiState.vaultSwitchActive)}">
		{$uiState.currentVault === "all"
			? $LL.nav.all()
			: $LL.nav[$uiState.currentVault]()}
		<span><DownArrow color="#85889C" /></span>
	</button>
	<span><Lens color="#85889C" size="24" /></span>
</div>
