<script lang="ts">
	import SetPassPhrase from "./SetPassPhrase.svelte";
	import ImportPvtKey from "./ImportPvtKey.svelte";
	import { createEventDispatcher } from "svelte";

	let challenge = "";
	let importPvtKeyFlag = false;
	const dispatch = createEventDispatcher();

	const handleRecovery = (e: any) => {
		importPvtKeyFlag = e.detail;
	};

	const handleSignedUp = () => {
		dispatch("signedUp");
	};
</script>

<div
	class="h-full w-full flex justify-center items-center text-base font-bold text-white">
	{#if importPvtKeyFlag}
		<ImportPvtKey on:login="{handleSignedUp}" />
	{:else}
		<SetPassPhrase {challenge} on:signedUp="{handleSignedUp}" />
	{/if}
</div>
