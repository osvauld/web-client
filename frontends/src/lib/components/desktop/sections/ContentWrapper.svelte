<script>
	import { currentView } from "../store/desktop.ui.store";

	import Home from "../views/Home.svelte";
	import Notes from "../views/Notes.svelte";
	import Cards from "../views/Cards.svelte";
	import Menu from "../../../../icons/Menu.svelte";
	import Add from "../../../../icons/add.svelte";
	import DownArrow from "../../../../icons/downArrow.svelte";

	const views = {
		home: { name: "Home", content: Home },
		notes: { name: "Notes", content: Notes },
		cards: { name: "Cards", content: Cards },
	};

	let addCredentialHovered = false;

	$: currentFolder = $currentView === "all" ? "Home" : views[$currentView].name;
	$: currentComponent =
		$currentView === "all" ? Home : views[$currentView].content;
</script>

<div class="grow flex flex-col">
	<div class="h-28 py-10 px-16 flex items-center justify-between">
		<h1 class="text-4xl font-light text-osvauld-sideListTextActive">
			{currentFolder}
		</h1>
		{#if currentFolder !== "Home"}
			<div class="gap-4 flex justify-between items-center">
				<span><Menu /></span>
				<button
					class="bg-osvauld-frameblack text-osvauld-textPassive flex justify-center items-center py-2 px-3 text-sm rounded-md ml-4">
					<span class="mr-2 pl-2">Latest</span>
					<span><DownArrow type="common" /></span>
				</button>
				<button
					class="rounded-md py-1.5 px-4 mx-2 flex justify-center items-center whitespace-nowrap text-sm border text-osvauld-textActive border-osvauld-iconblack hover:text-osvauld-frameblack hover:bg-osvauld-carolinablue transition-colors"
					on:mouseenter="{() => (addCredentialHovered = true)}"
					on:mouseleave="{() => (addCredentialHovered = false)}">
					<span class="mr-2">Add New {currentFolder}</span>
					<Add color="{addCredentialHovered ? '#0D0E13' : '#A3A4B5'}" />
				</button>
			</div>
		{/if}
	</div>
	<svelte:component this="{currentComponent}" />
</div>
