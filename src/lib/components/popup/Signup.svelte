<script lang="ts">
	import TempLogin from "./TempLogin.svelte";
	import SetPassPhrase from "./SetPassPhrase.svelte";
	import ImportPvtKey from "./ImportPvtKey.svelte";
	import { sendMessage } from "../dashboard/helper";
	import { createEventDispatcher } from "svelte";

	let isTempLoginVerified = false;
	let challenge = "";
	let username = "";
	let importPvtKeyFlag = false;
	const dispatch = createEventDispatcher();

	const handleTempLogin = (e: any) => {
		challenge = e.detail.challenge;
		username = e.detail.username;
		isTempLoginVerified = true;
	};

	const handleRecovery = (e: any) => {
		importPvtKeyFlag = e.detail;
	};

	const handleSignedUp = () => {
		dispatch("signedUp");
	};
</script>

<div
	class="h-full w-[90%] flex justify-center items-center text-base font-bold text-white"
>
	{#if importPvtKeyFlag}
		<ImportPvtKey on:login="{handleSignedUp}" />
	{:else if isTempLoginVerified}
		<SetPassPhrase {challenge} {username} on:signedUp="{handleSignedUp}" />
	{:else}
		<TempLogin
			on:setPassPhrase="{handleTempLogin}"
			on:recovery="{handleRecovery}"
		/>
	{/if}
</div>
