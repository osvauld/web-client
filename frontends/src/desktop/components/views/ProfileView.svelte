<script lang="ts">
	import { profileModal } from "../store/desktop.ui.store";
	import Initiator from "../../../mobile/components/views/Initiator.svelte";
	import Acceptor from "../../../mobile/components/views/Acceptor.svelte";
	import ClosePanel from "../../../icons/closePanel.svelte";
	let isInitiator = false;

	const toggleMode = () => {
		isInitiator = !isInitiator;
	};

	const goBack = () => {
		profileModal.set(false);
	};
</script>

<div
	class="fixed inset-0 z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[0.5px] flex justify-center items-center"
	role="dialog"
	on:click="{() => {
		profileModal.set(false);
	}}">
	<div
		class="w-[40rem] h-[44rem] bg-mobile-bgPrimary flex flex-col relative p-4 overflow-hidden">
		<!-- Tab Navigation -->
		<nav
			class="w-full h-[48px] px-3 flex items-center justify-end gap-2 flex-shrink-0">
			<button
				on:click="{goBack}"
				class="p-2.5 rounded-full bg-mobile-bgSeconary">
				<ClosePanel />
			</button>
		</nav>
		<div class="w-full h-[48px] flex justify-between items-center px-4">
			<div class="w-full flex border-b border-mobile-bgHighlight">
				<button
					class="flex-1 h-[48px] text-center {!isInitiator
						? 'text-mobile-textActive border-b-2 border-osvauld-carolinablue'
						: 'text-mobile-textSecondary'}"
					on:click|stopPropagation="{toggleMode}">
					Receive
				</button>
				<button
					class="flex-1 h-[48px] text-center {isInitiator
						? 'text-mobile-textActive border-b-2 border-osvauld-carolinablue'
						: 'text-mobile-textSecondary'}"
					on:click|stopPropagation="{toggleMode}">
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
	</div>
</div>
