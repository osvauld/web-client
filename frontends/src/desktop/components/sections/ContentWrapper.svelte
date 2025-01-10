<script>
	import {
		currentVault,
		selectedCategory,
		addCredentialModal,
		deleteConfirmationModal,
	} from "../store/desktop.ui.store";
	import Add from "../../../icons/add.svelte";
	import Menu from "../../../icons/Menu.svelte";
	import Bin from "../../../icons/binIcon.svelte";
	import DownArrow from "../../../icons/downArrow.svelte";
	import CredentialList from "../views/CredentialList.svelte";

	let addCredentialHovered = false;
</script>

<div class="flex-1 flex flex-col overflow-hidden">
	<div class="h-28 py-10 px-16 flex items-center justify-between flex-shrink-0">
		<h1
			class="text-4xl font-light text-osvauld-sideListTextActive flex justify-between items-center gap-3 capitalize max-w-1/2 truncate">
			{$selectedCategory ? $selectedCategory : $currentVault.name}
		</h1>

		<div class="gap-4 flex justify-between items-center ml-3">
			{#if $currentVault.id !== "all"}
				<button
					class="p-2"
					on:click|stopPropagation="{() => deleteConfirmationModal.set(true)}"
					><Bin color="#FF6A6A" /></button>
			{/if}
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
				on:mouseleave="{() => (addCredentialHovered = false)}"
				on:click="{() => addCredentialModal.set(true)}">
				<span class="mr-2">Add New Credential</span>
				<Add color="{addCredentialHovered ? '#000' : '#A3A4B5'}" />
			</button>
		</div>
	</div>
	<CredentialList />
</div>
