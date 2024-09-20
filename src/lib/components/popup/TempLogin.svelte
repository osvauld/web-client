<script lang="ts">
	import { getRegsitrationChallenge } from "../../apis/auth.api";
	import Eye from "../basic/icons/eye.svelte";
	import { createEventDispatcher } from "svelte";
	import Loader from "../dashboard/components/Loader.svelte";
	import ClosedEye from "../basic/icons/closedEye.svelte";

	import browser from "webextension-polyfill";
	import {
		LocalStorageService,
		StorageService,
	} from "../../../scripts/storageHelper";
	const dispatch = createEventDispatcher();

	let username: string = LocalStorageService.get("username") || "";
	let password = "";
	let baseurl: string = LocalStorageService.get("baseUrl") || "";
	let showPassword = false;
	let showVerificationError = false;
	let isLoaderActive = false;

	$: type = showPassword ? "text" : "password";
	$: LocalStorageService.set("username", username);
	$: LocalStorageService.set("baseUrl", baseurl);
	async function handleSubmit() {
		isLoaderActive = true;
		if (baseurl.length === 0) return;
		await StorageService.setBaseUrl(baseurl);
		if (username && password) {
			const challengeResponse = await getRegsitrationChallenge(
				username,
				password,
			);
			if (challengeResponse.success === false) {
				isLoaderActive = false;
				showVerificationError = true;
			}
			if (challengeResponse.data.challenge) {
				dispatch("setPassPhrase", {
					challenge: challengeResponse.data.challenge,
					username,
				});
				isLoaderActive = false;
			} else showVerificationError = true;
		}
	}
	function onInput(event: any) {
		password = event.target.value;
	}
	const togglePassword = () => {
		showPassword = !showPassword;
	};

	const triggerAccountRecovery = () => {
		dispatch("recovery", true);
	};
</script>

<form
	class="flex flex-col justify-center items-center box-border w-[90%]"
	on:submit|preventDefault="{handleSubmit}"
>
	<label for="baseurl" class="font-normal mt-6">Enter Base URL</label>
	<div
		class="flex bg-osvauld-frameblack px-3 mt-4 border rounded-lg border-osvauld-iconblack w-[260px]"
	>
		<input
			class="text-white bg-osvauld-frameblack border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0 w-full"
			type="text"
			autocomplete="off"
			id="baseurl"
			bind:value="{baseurl}"
		/>
	</div>

	<label for="username" class="font-normal mt-6">Enter Username</label>
	<div
		class="flex bg-osvauld-frameblack px-3 mt-4 border rounded-lg border-osvauld-iconblack w-[260px]"
	>
		<input
			class="text-white bg-osvauld-frameblack border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0 w-full"
			type="text"
			autocomplete="off"
			id="username"
			bind:value="{username}"
		/>
	</div>

	<label for="password" class="font-normal mt-6">Enter Password</label>

	<div
		class="flex bg-osvauld-frameblack px-3 mt-4 border rounded-lg border-osvauld-iconblack w-[260px]"
	>
		<input
			class="text-white bg-osvauld-frameblack border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0 w-full"
			{type}
			autocomplete="off"
			id="password"
			on:input="{onInput}"
		/>
		<button
			type="button"
			class="flex justify-center items-center"
			on:click="{togglePassword}"
		>
			{#if showPassword}
				<ClosedEye />
			{:else}
				<Eye />
			{/if}
		</button>
	</div>
	{#if showVerificationError}
		<span class="text-xs text-red-500 font-thin"
			>Wrong username or password</span
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
	<button
		class="bg-osvauld-ownerGreen py-2 px-10 mt-8 rounded-lg text-osvauld-ownerText font-medium w-[150px] flex justify-center items-center whitespace-nowrap"
		type="button"
		on:click="{triggerAccountRecovery}"
	>
		<span>Account Recovery</span></button
	>
</form>
