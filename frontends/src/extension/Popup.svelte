<script lang="ts">
	import { onMount } from "svelte";
	import Welcome from "../lib/components/popup/Welcome.svelte";
	import Home from "../lib/components/popup/Home.svelte";
	import { Logo } from "../lib/components/dashboard/icons";
	import Signup from "../lib/components/popup/Signup.svelte";
	import Loader from "../lib/components/dashboard/components/Loader.svelte";
	import { sendMessage } from "../lib/components/dashboard/helper";

	let loggedIn = true;
	let isLoaderActive = false;
	let isSignedUp = false;
	onMount(async () => {
		isLoaderActive = true;
		const response = await sendMessage("isSignedUp");
		isSignedUp = response.isSignedUp;
		const checkPvtLoad = await sendMessage("checkPvtLoaded");
		if (checkPvtLoad) {
			loggedIn = true;
		} else {
			loggedIn = false;
		}
		isLoaderActive = false;
		// isSignedUp.set(false);
	});

	const checkAuth = (event: CustomEvent) => {
		loggedIn = event.detail;
	};
</script>

<main>
	<div
		class="w-[22.5rem] h-[36.78rem] p-2 pt-3 flex flex-col !font-sans {isSignedUp &&
		!loggedIn
			? 'justify-center'
			: 'justify-start'} items-center bg-osvauld-frameblack">
		{#if isLoaderActive}
			<Loader />
		{:else if !isSignedUp}
			<Signup on:signedUp="{() => (isSignedUp = true)}" />
		{:else if loggedIn}
			<Home />
		{:else}
			<div class="mb-12 flex justify-center items-center">
				<Logo />
			</div>
			<Welcome on:authenticated="{checkAuth}" />
		{/if}
	</div>
</main>
