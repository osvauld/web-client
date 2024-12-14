<script lang="ts">
	import { CATEGORIES } from "../../../utils/CredentialUtils";
	import LL from "../../../i18n/i18n-svelte";
	import {
		currentLayout,
		selectedCredentialType,
	} from "../../store/mobile.ui.store";
	import Add from "../../../icons/add.svelte";
	const handleClick = (categoryId: string) => {
		selectedCredentialType.set(categoryId);
		currentLayout.set("credential");
	};
</script>

<div class="p-3">
	<div class="text-mobile-textPrimary font-semibold text-2xl">
		Add New Secret
	</div>
	<div class="text-base font-normal text-mobile-textSecondary">
		Choose our secret category to add
	</div>
</div>

<div
	class="text-base grid grid-cols-2 gap-3 px-1 py-2 mx-2 text-mobile-textPrimary">
	{#each CATEGORIES as category (category.id)}
		<button
			class=" bg-mobile-bgSeconary rounded-lg px-3 py-2.5 h-[100px]
               active:bg-mobile-bgHighlight/10 transition-colors touch-manipulation"
			on:click="{() => handleClick(category.id)}">
			<div class="flex justify-between items-center">
				<svelte:component this="{category.icon}" color="#85889C" />
				<span> <Add color="#85889C" /></span>
			</div>
			<div class="text-left text-base pt-2 leading-tight">
				{$LL.types[category.id]()}
			</div>
		</button>
	{/each}
</div>
