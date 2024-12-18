<script>
	import {
		currentView,
		currentVault,
		credentialListWithType,
	} from "../store/desktop.ui.store";
	import { CATEGORIES } from "../../utils/credentialUtils";
	import HomeIcon from "../../../icons/mobileHome.svelte";
	import Add from "../../../icons/add.svelte";
	import Menu from "../../../icons/Menu.svelte";
	import DownArrow from "../../../icons/downArrow.svelte";
	import CredentialList from "../views/CredentialList.svelte";

	// const views = {
	// 	home: { name: "Home", content: Home, icon: HomeIcon },
	// 	notes: { name: "Notes", content: Notes, icon: NoteIcon },
	// 	cards: { name: "Cards", content: Cards, icon: CreditCard },
	// };

	let addCredentialHovered = false;

	// $: ({
	// 	name: currentFolder,
	// 	content: currentComponent,
	// 	icon: currentIcon,
	// } = $currentView === "all"
	// 	? { name: "Home", content: Home, icon: HomeIcon }
	// 	: views[$currentView]);
</script>

<div class="flex-1 flex flex-col overflow-hidden">
	<div class="h-28 py-10 px-16 flex items-center justify-between flex-shrink-0">
		<h1
			class="text-4xl font-light text-osvauld-sideListTextActive flex justify-between items-center gap-3 capitalize max-w-1/2 truncate">
			{$credentialListWithType ? $credentialListWithType : $currentVault.name}
		</h1>
		<div class="gap-4 flex justify-between items-center ml-3">
			<span><Menu /></span>
			<button
				class="bg-osvauld-frameblack text-osvauld-textPassive flex justify-center items-center py-2 px-3 text-sm rounded-md ml-4"
				aria-label="Sort by latest">
				<span class="mr-2 pl-2">Latest</span>
				<span><DownArrow type="common" /></span>
			</button>
			<button
				class="rounded-md py-1.5 px-4 mx-2 flex justify-center items-center whitespace-nowrap text-sm border text-osvauld-textActive border-osvauld-iconblack hover:text-osvauld-frameblack hover:bg-osvauld-carolinablue transition-colors"
				on:mouseenter="{() => (addCredentialHovered = true)}"
				on:mouseleave="{() => (addCredentialHovered = false)}">
				<span class="mr-2">Add New Credential</span>
				<Add color="{addCredentialHovered ? '#0D0E13' : '#A3A4B5'}" />
			</button>
		</div>
	</div>
	<CredentialList />
</div>
