<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { onMount } from "svelte";
	import Home from "../lib/components/mobile/components/Home.svelte";
	import Welcome from "../lib/components/popup/Welcome.svelte";
	import { Logo } from "../lib/components/dashboard/icons";
	import Signup from "../lib/components/popup/Signup.svelte";
	import Loader from "../lib/components/dashboard/components/Loader.svelte";

	let loggedIn = true;
	let isLoaderActive = false;
	let isSignedUp = false;
	onMount(async () => {
		isLoaderActive = true;
		const response = await invoke("check_signup_status");
		isSignedUp = response.isSignedUp;
		const checkPvtLoad = await invoke("check_private_key_loaded");
		if (checkPvtLoad) {
			loggedIn = true;
		} else {
			loggedIn = false;
		}
		isLoaderActive = false;
		// isSignedUp.set(false);
	});

	const handleSignUp = async () => {
		try {
			await Promise.all([
				invoke("handle_add_folder", {
					input: { name: "Personal", description: "" },
				}),
				invoke("handle_add_folder", {
					input: { name: "Work", description: "" },
				}),
			]);
		} catch (e) {
			console.log("error detected", e);
		}

		isSignedUp = true;
	};

	const checkAuth = (event: CustomEvent) => {
		loggedIn = event.detail;
	};
</script>

<main
	class="w-screen h-screen p-2 pt-3 flex flex-col !font-sans {isSignedUp &&
	!loggedIn
		? 'justify-center'
		: 'justify-start'} items-center bg-osvauld-frameblack">
	{#if isLoaderActive}
		<Loader />
	{:else if !isSignedUp}
		<Signup on:signedUp="{handleSignUp}" />
	{:else if loggedIn}
		<Home />
	{:else}
		<div class="mb-12 flex justify-center items-center">
			<Logo />
		</div>
		<Welcome on:authenticated="{checkAuth}" />
	{/if}
</main>
