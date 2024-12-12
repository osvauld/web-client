<script lang="ts">
	import { onMount } from "svelte";
	import { scale } from "svelte/transition";
	import MobileDownArrow from "../../../icons/mobileDownArrow.svelte";
	import Tick from "../../../icons/tick.svelte";
	import CopyIcon from "../../../icons/copyIcon.svelte";
	import More from "../../../icons/more.svelte";
	import Share from "../../../icons/share.svelte";
	import Edit from "../../../icons/editIcon.svelte";

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
	import { writeToClipboard } from "../../../lib/components/dashboard/helper";
	import MobileHome from "../../../icons/mobileHome.svelte";

	let credentialFields = [];
	let copied = false;
	let copiedItemIndex;

	const directToHome = () => {
		currentLayout.set("home");
		bottomNavActive.set(true);
		credentialDataCached.set({});
		credentialLayoutType.set("addition");
	};

	const copyToClipboard = async (fieldValue, index) => {
		copiedItemIndex = index;
		copied = true;

		await writeToClipboard(fieldValue);
		setTimeout(() => {
			copied = false;
		}, 2000);
	};

	onMount(() => {
		bottomNavActive.set(false);
		console.log("credentialDataCached =>", $credentialDataCached);
	});
</script>

<nav class="w-full h-[48px] pr-3 flex items-center gap-1 flex-shrink-0">
	<button on:click="{directToHome}" class="p-2 pr-1">
		<span class="inline-block rotate-90">
			<MobileDownArrow />
		</span>
	</button>
	<span class="ml-auto"><Edit /></span>
	<span class="mx-2"><Share /></span>
	<span><More /></span>
</nav>
<div class="text-mobile-textPrimary text-2xl font-medium flex flex-col pl-4">
	<span>{$credentialDataCached.data.credentialType}</span>
	<div class="flex text-sm font-light gap-1 items-center">
		<span><MobileHome size="{14}" /></span>
		{$credentialDataCached.data.vault}
	</div>
</div>

<div class="grow flex p-4 text-mobile-textPrimary">
	<div
		class="max-h-full grow overflow-y-auto scrollbar-thin flex flex-col gap-2 mt-2">
		{#each $credentialDataCached.data.credentialFields as field, index (field.fieldName)}
			{#if field.fieldValue.trim().length !== 0}
				<div>{field.fieldName}</div>
				<div class="flex gap-2">
					<div class="bg-mobile-bgSeconary rounded-lg py-2.5 px-4 flex-1">
						<div>{field.fieldValue}</div>
					</div>
					<button
						class="bg-mobile-bgSeconary rounded-lg p-3"
						on:click|preventDefault|stopPropagation="{() =>
							copyToClipboard(field.fieldValue, index)}">
						{#if copied && copiedItemIndex === index}
							<span in:scale>
								<Tick />
							</span>
						{:else}
							<CopyIcon color="{'#4D4F60'}" />
						{/if}
					</button>
				</div>
			{/if}
		{/each}

		<hr class="h-px bg-mobile-bgHighlight mt-auto" />
		<div class="bg-mobile-bgSeconary rounded-lg h-[100px] p-3">
			Created at {new Date().getTime()}
		</div>
	</div>
</div>
