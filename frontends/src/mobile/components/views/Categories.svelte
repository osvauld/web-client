<script lang="ts">
	import { CATEGORIES } from "../../../utils/mobileUtils";
	import LL from "../../../i18n/i18n-svelte";
	import {
		currentLayout,
		selectedCredentialType,
	} from "../../store/mobile.ui.store";
	const handleClick = (categoryId: string) => {
		selectedCredentialType.set(categoryId);
		currentLayout.set("credential");
	};
</script>

<button
	class="px-3 h-[40px] flex justify-between items-center w-full active:bg-mobile-bgHighlight/10">
	<span class="text-mobile-textSecondary">{$LL.categories()}</span>
</button>

<div class="text-base grid grid-cols-2 gap-3 px-1 mx-2 text-mobile-textPrimary">
	{#each CATEGORIES as category (category.id)}
		<button
			class="relative border border-mobile-bgHighlight bg-mobile-bgSeconary rounded-lg px-3 py-2.5 h-[90px]
               active:bg-mobile-bgHighlight/10 transition-colors touch-manipulation"
			on:click="{() => handleClick(category.id)}">
			<div class="flex flex-col h-full items-center justify-center gap-2">
				{#if category.icon}
					<span class="flex justify-center items-center">
						<svelte:component this="{category.icon}" color="#85889C" />
					</span>
				{/if}
				<span class="text-center text-sm leading-tight"
					>{$LL.types[category.id]()}</span>
			</div>
		</button>
	{/each}
</div>
