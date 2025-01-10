<script lang="ts">
	import { profileModal } from "../store/desktop.ui.store";
	import Initiator from "../../../mobile/components/views/Initiator.svelte";
	import Acceptor from "../../../mobile/components/views/Acceptor.svelte";
	import ClosePanel from "../../../icons/closePanel.svelte";
	import Qr from "./Qr.svelte";

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
	on:click="{() => {}}">


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
		<Qr />
	</div>
</div>
