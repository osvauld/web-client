<script lang="ts">
	import Eye from "../basic/icons/eye.svelte";
	import ClosedEye from "../basic/icons/closedEye.svelte";
	import Loader from "../dashboard/components/Loader.svelte";
	import { sendMessage } from "../dashboard/helper";
	import { createEventDispatcher } from "svelte";
	import { finalRegistration } from "../dashboard/apis";

	export let challenge: string;
	export let username: string;

	const dispatch = createEventDispatcher();
	let passphrase = "";
	let confirmPassphrase = "";
	let showFirstPassword = false;
	let showSecondPassword = false;
	let showPassphraseMismatchError = false;
	let passphraseEmpty = false;
	let isLoaderActive = false;

	$: type1 = showFirstPassword ? "text" : "password";
	$: type2 = showSecondPassword ? "text" : "password";

	const handlePassPhraseSubmit = async () => {
		if (passphrase.length === 0) {
			passphraseEmpty = true;
			isLoaderActive = false;
			setTimeout(() => {
				passphraseEmpty = false;
			}, 1500);
			return;
		}
		isLoaderActive = true;
		if (passphrase === confirmPassphrase) {
			const response = await sendMessage("savePassphrase", {
				passphrase,
				challenge,
				username,
			});
			const registrationResponse = await finalRegistration(
				response.username,
				response.signature,
				response.deviceKey,
				response.encryptionKey,
			);
			if (registrationResponse.success) {
				isLoaderActive = false;
				dispatch("signedUp");
			}
		} else {
			showPassphraseMismatchError = true;
			isLoaderActive = false;
			setTimeout(() => {
				showPassphraseMismatchError = false;
			}, 1500);
		}
	};
	function onInput(event: any, type: string) {
		if (type === "passphrase") passphrase = event.target.value;
		else confirmPassphrase = event.target.value;
	}

	const togglePassword = (identification: boolean) => {
		identification
			? (showFirstPassword = !showFirstPassword)
			: (showSecondPassword = !showSecondPassword);
	};
</script>

<form
	class="flex flex-col justify-center items-center"
	on:submit|preventDefault="{handlePassPhraseSubmit}"
>
	<label for="passphrase" class="font-normal mt-6">Enter Passphrase</label>

	<div
		class="flex bg-osvauld-frameblack px-3 mt-4 border rounded-lg border-osvauld-iconblack"
	>
		<input
			class="text-white bg-osvauld-frameblack border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0 w-full"
			type="{type1}"
			autocomplete="off"
			id="password"
			on:input="{(e) => onInput(e, 'passphrase')}"
		/>

		<button
			type="button"
			class="flex justify-center items-center"
			on:click="{() => togglePassword(true)}"
		>
			{#if showFirstPassword}
				<ClosedEye />
			{:else}
				<Eye />
			{/if}
		</button>
	</div>
	<label for="passphrase" class="font-normal mt-6">Confirm Passphrase</label>

	<div
		class="flex bg-osvauld-frameblack px-3 mt-4 border rounded-lg border-osvauld-iconblack"
	>
		<input
			class="text-white bg-osvauld-frameblack border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0 w-full"
			type="{type2}"
			autocomplete="off"
			id="password"
			on:input="{(e) => onInput(e, 'confirmPassphrase')}"
		/>

		<button
			type="button"
			class="flex justify-center items-center"
			on:click="{() => togglePassword(false)}"
		>
			{#if showSecondPassword}
				<ClosedEye />
			{:else}
				<Eye />
			{/if}
		</button>
	</div>

	{#if passphraseEmpty}
		<span
			class="mt-2 text-xs text-red-400 font-light {passphraseEmpty
				? 'visible'
				: 'invisible'}">Passphrase Empty!</span
		>
	{:else}
		<span
			class="mt-2 text-xs text-red-400 font-light {showPassphraseMismatchError
				? 'visible'
				: 'invisible'}">Passphrase doesn't match</span
		>
	{/if}

	<button
		class="bg-osvauld-carolinablue py-2 px-10 mt-8 rounded-lg text-osvauld-ninjablack font-medium w-[150px] flex justify-center items-center whitespace-nowrap"
		type="submit"
	>
		{#if isLoaderActive}
			<Loader size="{24}" color="#1F242A" duration="{1}" />
		{:else}
			<span>Submit</span>
		{/if}</button
	>
</form>
