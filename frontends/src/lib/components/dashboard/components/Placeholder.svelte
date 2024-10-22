<script lang="ts">
	import { onMount } from "svelte";
	import { showAddFolderDrawer, showAddGroupDrawer } from "../store";
	import { Add } from "../icons";
	import { getUserDetails } from "../../../store/storeHelper";

	let isFirstCardHovered = false;
	let isSecondCardHovered = false;
	let username = "";

	const createFolderManager = () => {
		showAddFolderDrawer.set(true);
	};

	onMount(async () => {
		const accountDetails = await getUserDetails();
		username = accountDetails.username;
	});
</script>

<div
	class="px-[11.30rem] py-[3.25rem] w-full h-[40rem] bg-osvauld-frameblack text-osvauld-sheffieldgrey font-normal text-xl flex flex-col gap-4 justify-center items-center">
	<div
		class="w-full flex flex-col justify-center items-start font-Jakarta text-6xl text-osvauld-textActive">
		<h1 class="font-Jakarta text-5xl">Welcome, {username}</h1>
		<p class="font-sans text-base font-light mt-4">
			Lets Jump right onto things!
		</p>
	</div>
	<div
		class="flex justify-around items-center flex-wrap gap-4 min-w-[40rem] max-w-[60rem] h-[30rem]">
		<div
			class="bg-osvauld-cardshade h-[80%] w-[48%] rounded-3xl flex flex-col gap-7 justify-center items-start p-14 border border-transparent transition duration-300 ease-in-out hover:border-osvauld-iconblack hover:-translate-y-1 hover:scale-101 cursor-pointer hover:shadow-[0_14px_15px_rgba(0,0,0,0.25),0_10px_10px_rgba(0,0,0,0.22)] text-osvauld-textActive overflow-hidden"
			role="option"
			tabindex="0"
			aria-selected="{isFirstCardHovered}"
			on:mouseenter="{() => (isFirstCardHovered = true)}"
			on:mouseleave="{() => (isFirstCardHovered = false)}">
			<h2 class="text-3xl">Organize your credentials</h2>
			<p class="text-base">
				Create a new folder to securely store your credentials. Stay organized
				and access them easily whenever you need.
			</p>
			<button
				class="flex justify-center items-center text-base border text-osvauld-textActive border-osvauld-iconblack rounded-md px-4 py-1 {isFirstCardHovered &&
					'bg-osvauld-carolinablue !text-osvauld-frameblack'} transition-colors duration-300 !ease-in"
				on:click="{createFolderManager}">
				<span class="mr-1 whitespace-nowrap">Create new folder</span>
				<Add color="{isFirstCardHovered ? '#000' : '#A3A4B5'}" /></button>
		</div>

		<div
			class="bg-osvauld-cardshade h-[80%] w-[48%] rounded-3xl flex flex-col justify-center gap-7 items-start p-14 border border-transparent transition duration-300 ease-in-out hover:border-osvauld-iconblack hover:-translate-y-1 hover:scale-101 cursor-pointer hover:shadow-[0_14px_28px_rgba(0,0,0,0.25),0_10px_10px_rgba(0,0,0,0.22)] text-osvauld-textActive overflow-hidden"
			role="option"
			tabindex="0"
			aria-selected="{isSecondCardHovered}"
			on:mouseenter="{() => (isSecondCardHovered = true)}"
			on:mouseleave="{() => (isSecondCardHovered = false)}">
			<h2 class="text-3xl">Collaborate with teams</h2>
			<p class="text-base">
				Start a new group to collaborate, share your credentials, manage access,
				and streamline your workflows.
			</p>
			<button
				class="flex justify-center items-center text-base border text-osvauld-textActive border-osvauld-iconblack rounded-md px-4 py-1 {isSecondCardHovered &&
					'bg-osvauld-carolinablue !text-osvauld-frameblack'} transition-colors duration-300 !ease-in">
				<span class="mr-1 whitespace-nowrap">Start new group</span>
				<Add color="{isSecondCardHovered ? '#000' : '#A3A4B5'}" />
			</button>
		</div>
	</div>
	<div class="w-full flex justify-center items-center">
		<div
			class="w-1/2 h-10 flex justify-end items-center text-sm text-osvauld-textActive pr-4">
			<a href="https://osvauld.com" target="_blank" rel="noopener noreferrer"
				>Visit osvauld.com</a>
		</div>
		<div
			class="w-1/2 h-10 flex justify-start items-center border-l border-osvauld-iconblack text-sm text-osvauld-textActive pl-4">
			<a
				href="https://docs.osvauld.com/introduction/overview/"
				target="_blank"
				rel="noopener noreferrer">Read osvauld docs</a>
		</div>
	</div>
</div>
