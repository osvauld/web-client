<script>
	import { CATEGORIES, THEMES } from "../utils/helper";
	import LL from "../../../../i18n/i18n-svelte";
	import DownArrow from "../../../../icons/mobileDownArrow.svelte";
	import CreditCard from "../../../../icons/creditCard.svelte";
	import KeyIcon from "../../../../icons/mobileKey.svelte";
	import LoginIcon from "../../../../icons/pwdGen.svelte";
	import MobileOldKey from "../../../../icons/mobileOldKey.svelte";
	import MobileBank from "../../../../icons/mobileBank.svelte";
	import MobileDatabase from "../../../../icons/mobileDatabase.svelte";
	import MobileApiIcon from "../../../../icons/mobileApiIcon.svelte";
	import MobileNote from "../../../../icons/mobileNote.svelte";
	import MobileContact from "../../../../icons/mobileContact.svelte";
	import MobileWallet from "../../../../icons/mobileWallet.svelte";

	export let isRecentsVisible;
	export let selectedCredentialType;
	let isCategoriesVisible = true;
	export let selectedTheme;
</script>

<style>
	.overflow-container {
		max-height: 380px;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		overscroll-behavior: contain;
		scroll-behavior: smooth;
		will-change: transform;
		transform: translateZ(0);
		-webkit-transform: translateZ(0);
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
		perspective: 1000;
		-webkit-perspective: 1000;
	}

	.overflow-container::-webkit-scrollbar {
		width: 4px;
		background-color: #111218;
	}

	.overflow-container::-webkit-scrollbar-thumb {
		background-color: #20212b;
		border-radius: 2px;
	}
</style>

<button
	class="px-3 h-[40px] flex justify-between items-center w-full active:bg-mobile-bgHighlight/10"
	aria-expanded="{isCategoriesVisible}"
	on:click="{() => (isCategoriesVisible = !isCategoriesVisible)}">
	<span class="text-mobile-textSecondary">{$LL.categories()}</span>
	<span
		class="transition-transform duration-200"
		style="transform: rotate({isCategoriesVisible ? 0 : -90}deg)">
		<DownArrow color="{THEMES[selectedTheme]}" />
	</span>
</button>

{#if isCategoriesVisible}
	<div
		class="text-base grid grid-cols-2 gap-3 px-1 mx-2 text-mobile-textPrimary"
		class:overflow-container="{isRecentsVisible}">
		{#each CATEGORIES as category (category.id)}
			<button
				class="relative border border-mobile-bgHighlight bg-mobile-bgSeconary rounded-lg px-3 py-2.5 h-[90px]
               active:bg-mobile-bgHighlight/10 transition-colors touch-manipulation"
				on:click="{() => (selectedCredentialType = category.id)}">
				<div class="flex flex-col h-full items-center justify-center gap-2">
					{#if category.icon}
						<span class="flex justify-center items-center">
							<svelte:component
								this="{category.icon}"
								color="{THEMES[selectedTheme]}" />
						</span>
					{/if}
					<span class="text-center text-sm leading-tight"
						>{$LL.types[category.id]()}</span>
				</div>
			</button>
		{/each}
	</div>
{/if}
