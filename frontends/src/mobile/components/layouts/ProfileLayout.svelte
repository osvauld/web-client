<script lang="ts">
	import Initiator from "../views/Initiator.svelte";
	import Acceptor from "../views/Acceptor.svelte";
	import { slide } from "svelte/transition";

	let isInitiator = false;

	const toggleMode = () => {
		isInitiator = !isInitiator;
	};
</script>

<main
	class="w-screen h-screen bg-mobile-bgPrimary flex flex-col relative pt-[48px] pb-[60px] overflow-hidden">
	<!-- Tab Navigation -->
	<div
		class="w-full h-[48px] flex justify-between items-center px-4 fixed top-0">
		<div class="w-full flex border-b border-mobile-bgHighlight">
			<button
				class="flex-1 h-[48px] text-center {!isInitiator
					? 'text-mobile-textActive border-b-2 border-osvauld-carolinablue'
					: 'text-mobile-textSecondary'}"
				on:click="{toggleMode}">
				Receive
			</button>
			<button
				class="flex-1 h-[48px] text-center {isInitiator
					? 'text-mobile-textActive border-b-2 border-osvauld-carolinablue'
					: 'text-mobile-textSecondary'}"
				on:click="{toggleMode}">
				Send
			</button>
		</div>
	</div>

	<!-- Content Area -->
	<div class="grow overflow-y-auto">
		{#if isInitiator}
			<Initiator />
		{:else}
			<Acceptor />
		{/if}
	</div>
</main>
