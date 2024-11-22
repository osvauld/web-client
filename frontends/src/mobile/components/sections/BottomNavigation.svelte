<script lang="ts">
	import LL from "../../../i18n/i18n-svelte";
	import Profile from "../../../icons/profile.svelte";
	import Add from "../../../icons/mobileAdd.svelte";
	import PwdGen from "../../../icons/pwdGen.svelte";
	import Home from "../../../icons/mobileHome.svelte";
	import { categorySelection, currentVault } from "../../store/mobile.ui.store";
	import { allUsersSelected } from "../../../lib/store/ui.store";
</script>

<nav
	class="h-[60px] w-full fixed bottom-0 bg-mobile-navBlue flex text-base font-sans font-normal text-mobile-iconPrimary">
	<button
		class=" flex-1 flex justify-center items-center flex-col"
		on:click="{() => {
			currentVault.set({ id: 'all', name: 'All' });
			categorySelection.set(false);
		}}">
		<span class="flex justify-center items-center"
			><Home color="{'#5B5D6D'}" /></span>
		<span>{$LL.tabs.home()}</span>
	</button>
	<button
		class=" flex-1 flex justify-center items-center flex-col"
		on:click="{() => categorySelection.set(!$categorySelection)}">
		<span class="flex justify-center items-center"
			><Add color="{'#5B5D6D'}" /></span>
		<span>{$LL.tabs.add()}</span></button>
	<button class=" flex-1 flex justify-center items-center flex-col"
		><span class="flex justify-center items-center"
			><PwdGen color="{'#5B5D6D'}" /></span>
		<span>{$LL.tabs.generator()}</span></button>
	<button class=" flex-1 flex flex-col justify-center items-center">
		<span class="flex justify-center items-center"
			><Profile color="{'#5B5D6D'}" /></span>
		<span>{$LL.tabs.profile()}</span></button>
</nav>
