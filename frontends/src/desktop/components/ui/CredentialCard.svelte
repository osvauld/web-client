<script lang="ts">
	import {
		renderRelevantHeading,
		CATEGORIES,
	} from "../../utils/credentialUtils";

	import { sendMessage } from "../../../lib/components/dashboard/helper";
	import { onMount, createEventDispatcher } from "svelte";
	import MenuVertical from "../../../icons/menuVertical.svelte";
	import Star from "../../../icons/star.svelte";
	import FavStar from "../../../icons/favStar.svelte";
	import CredentialOverview from "./CredentialOverview.svelte";

	export let credential;
	export let credentialcardstates = [];
	let starred = false;

	const dispatch = createEventDispatcher();

	let type = credential.data.credentialType;
	let categoryInfo = CATEGORIES.find((item) => item.type === type);

	const dispatchDoubleClick = (credential) => {
		dispatch("dbl", credential);
	};

	const dispatchClick = (id) => {
		dispatch("clk", id);
	};

	const toggleFavorite = async (id) => {
		starred = !starred;
		// const toggleResp = await sendMessage("toggleFav", { credentialId: id });
		// Call the API to toggle the favorite status
		// Refresh credential list
	};
</script>

<div class="min-w-0">
	<button
		class="bg-osvauld-frameblack w-full border border-osvauld-cardBorder rounded-xl p-4"
		on:dblclick|stopPropagation="{() => dispatchDoubleClick(credential)}"
		on:click|stopPropagation="{() => dispatchClick(credential.id)}">
		<div class="flex items-center mb-4">
			<span
				class="flex justify-center items-center p-2.5 bg-osvauld-fieldActive rounded-md mr-3">
				{#if categoryInfo && categoryInfo.icon}
					<svelte:component this="{categoryInfo.icon}" color="{'#BFC0CC'}" />
				{:else}
					<span>!</span>
				{/if}
			</span>
			<button
				class="ml-auto p-2.5 bg-osvauld-fieldActive rounded-md flex justify-center items-center active:scale-95"
				on:click|stopPropagation="{() => toggleFavorite(credential.id)}">
				{#if starred}
					<FavStar />
				{:else}
					<Star />
				{/if}
			</button>
			<button
				class="ml-3 p-2.5 bg-osvauld-fieldActive rounded-md flex justify-center items-center"
				on:click|stopPropagation="{() => {}}">
				<MenuVertical />
			</button>
		</div>
		<div class="flex flex-col">
			<h3
				class="font-Jakarta text-xl font-medium text-left text-mobile-textbright truncate max-w-[16rem]">
				{renderRelevantHeading(
					credential.data.credentialFields,
					type,
					credential.id,
				)}
			</h3>
			<span class="text-xs text-left text-mobile-textPrimary">
				{type}
			</span>
		</div>
		{#if credentialcardstates.find((item) => item.id === credential.id)?.show}
			<CredentialOverview {type} fields="{credential.data.credentialFields}" />
		{/if}
	</button>
</div>
