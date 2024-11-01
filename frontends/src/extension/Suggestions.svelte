<script lang="ts">
	import { onMount } from "svelte";
	import SuccessView from "../lib/components/content/components/SuccessView.svelte";
	import FolderView from "../lib/components/content/components/FolderView.svelte";
	import SuggestionView from "../lib/components/content/components/SuggestionView.svelte";
	import { ModifiedEvent } from "../lib/dtos/event.dto";

	let folderView = false;
	let successView = false;
	let isSuccess = false;
	let iframeCustomEvent: ModifiedEvent;

	onMount(async () => {
		window.addEventListener("message", (event) => {
			if (event.data.id !== "osvauld") {
				return;
			}
			iframeCustomEvent = {
				data: event.data,
				source: event.source as MessageEventSource,
				origin: event.origin,
			};
		});
	});
</script>

<div
	class="w-full h-[200px] bg-osvauld-frameblack text-base text-white overflow-hidden">
	<span class="font-extrabold text-2xl text-white pb-4">osvauld</span>
	{#if successView}
		<SuccessView {isSuccess} {iframeCustomEvent} />
	{:else if folderView}
		<FolderView
			{iframeCustomEvent}
			bind:isSuccess
			bind:triggerSuccess="{successView}" />
	{:else}
		<SuggestionView {iframeCustomEvent} bind:value="{folderView}" />
	{/if}
</div>
