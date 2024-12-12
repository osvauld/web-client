<script lang="ts">
	import { onMount } from "svelte";
	import MobileDownArrow from "../../../icons/mobileDownArrow.svelte";
	import {
		CATEGORIES,
		credentialFieldsUpdater,
	} from "../../../utils/mobileUtils";

	import {
		currentLayout,
		bottomNavActive,
		credentialDataCached,
		credentialLayoutType,
	} from "../../store/mobile.ui.store";

	import { addCredentialHandler } from "../../../utils/addCredentialHelper";

	const directToHome = () => {
		currentLayout.set("home");
		bottomNavActive.set(true);
		credentialDataCached.set({});
		credentialLayoutType.set("addition");
	};

	let credentialFields = [];

	onMount(() => {
		bottomNavActive.set(false);
		console.log("credentialDataCached =>", $credentialDataCached);
	});
</script>

<nav
	class="w-full h-[48px] pr-3 flex justify-start items-center gap-1 flex-shrink-0">
	<button on:click="{directToHome}" class="p-2 pr-1">
		<span class="inline-block rotate-90">
			<MobileDownArrow />
		</span>
	</button>
	<!-- <svelte:component this="{selectedCategory.icon}" color="#85889C" /> -->
	<h1 class="text-mobile-textPrimary text-2xl font-medium">
		{$credentialDataCached.data.credentialType}
	</h1>
</nav>

<div class="grow p-4 text-mobile-textPrimary">
	<!-- <span>Enter your {selectedCategory?.type} details</span> -->
	<div
		class="max-h-full overflow-y-auto scrollbar-thin flex flex-col gap-4 mt-2">
		{#each $credentialDataCached.data.credentialFields as field (field.fieldName)}
			<div class="bg-mobile-bgLight rounded-lg">
				<div>{field.fieldName}</div>
				<div>{field.fieldValue}</div>
			</div>
		{/each}
		<hr />
		<div class="bg-mobile-bgLight rounded-lg h-[100px]">
			Created at {new Date().getTime()}
		</div>
	</div>
</div>
