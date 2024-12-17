<script>
	import Arrow from "../../../icons/rightArrow.svelte";
	import Home from "../../../icons/mobileHome.svelte";
	import Star from "../../../icons/star.svelte";
	import Folder from "../../../icons/folderIcon.svelte";
	import CreditCard from "../../../icons/creditCard.svelte";
	import KeyIcon from "../../../icons/mobileKey.svelte";
	import LoginIcon from "../../../icons/pwdGen.svelte";
	import BankIcon from "../../../icons/mobileBank.svelte";
	import DatabaseIcon from "../../../icons/mobileDatabase.svelte";
	import OldKey from "../../../icons/mobileOldKey.svelte";
	import ApiIcon from "../../../icons/mobileApiIcon.svelte";
	import NoteIcon from "../../../icons/mobileNote.svelte";
	import ContactIcon from "../../../icons/mobileContact.svelte";
	import WalletIcon from "../../../icons/mobileWallet.svelte";
	import { createEventDispatcher } from "svelte";
	import VaultSelector from "../views/VaultSelector.svelte";
	const dispatch = createEventDispatcher();
	import { currentView } from "../store/desktop.ui.store";

	export let activeSection = "home";

	let vaultSelectorActive = false;

	function handleSectionChange(section) {
		activeSection = section;
		currentView.set(section);
	}
</script>

<nav
	class="w-[360px] py-10 px-4 whitespace-nowrap"
	aria-label="Main Navigation">
	<div class=" relative">
		<button
			class="w-full text-[26px] text-osvauld-fieldText font-medium leading-6 bg-osvauld-frameblack rounded-xl border border-osvauld-defaultBorder px-4 py-3 flex justify-between items-center"
			aria-label="Switch Vault"
			aria-controls="vaultSelector"
			aria-expanded="false"
			on:click="{() => (vaultSelectorActive = !vaultSelectorActive)}"
			>All Vaults <span
				class="transition-transform duration-300 {vaultSelectorActive
					? '-rotate-90'
					: 'rotate-90'}"><Arrow color="#F2F2F0" size="24" /></span
			></button>
		{#if vaultSelectorActive}
			<VaultSelector />
		{/if}
	</div>
	<div
		class="border-y border-osvauld-borderColor text-osvauld-fieldText flex flex-col my-6 py-1 gap-1">
		<ul class="space-y-1 font-light text-base text-" role="list">
			<li>
				<button
					class="w-full flex items-center gap-3 p-3 rounded-lg
                       transition-colors
                       {activeSection === 'home'
						? 'text-osvauld-sideListTextActive bg-osvauld-fieldActive'
						: ''}"
					on:click="{() => handleSectionChange('all')}"
					aria-current="{activeSection === 'home' ? 'page' : undefined}">
					<Home color="{activeSection === 'home' ? '#F2F2F0' : '#85889C'}" />
					<span>Home</span>
				</button>
			</li>
			<li>
				<button
					class="w-full flex items-center gap-3 p-3 rounded-lg
                       {activeSection === 'favourites'
						? 'text-osvauld-sideListTextActive bg-osvauld-fieldActive'
						: ''}"
					on:click="{() => handleSectionChange('favourites')}"
					aria-current="{activeSection === 'favourites' ? 'page' : undefined}">
					<Star
						color="{activeSection === 'favourites' ? '#F2F2F0' : '#85889C'}" />
					<span>Favourites</span>
				</button>
			</li>
		</ul>
	</div>
	<ul class="font-light text-base space-y-1 text-osvauld-fieldText" role="list">
		<li>
			<button
				class="w-full flex items-center gap-3 p-3 rounded-lg
                       transition-colors
						  {activeSection === 'logins'
					? 'text-osvauld-sideListTextActive bg-osvauld-fieldActive'
					: ''}"
				on:click="{() => handleSectionChange('logins')}"
				aria-current="{activeSection === 'logins' ? 'page' : undefined}">
				<LoginIcon
					color="{activeSection === 'logins' ? '#F2F2F0' : '#85889C'}" />
				<span>Logins</span>
			</button>
		</li>
		<li>
			<button
				class="w-full flex items-center gap-3 p-3 rounded-lg
                       transition-colors
						  {activeSection === 'pins'
					? 'text-osvauld-sideListTextActive bg-osvauld-fieldActive'
					: ''}"
				logins
				on:click="{() => handleSectionChange('pins')}"
				aria-current="{activeSection === 'pins' ? 'page' : undefined}">
				<KeyIcon color="{activeSection === 'pins' ? '#F2F2F0' : '#85889C'}" />
				<span>PINs</span>
			</button>
		</li>
		<li>
			<button
				class="w-full flex items-center gap-3 p-3 rounded-lg
                       transition-colors
						  {activeSection === 'cards'
					? 'text-osvauld-sideListTextActive bg-osvauld-fieldActive'
					: ''}"
				on:click="{() => handleSectionChange('cards')}"
				aria-current="{activeSection === 'cards' ? 'page' : undefined}">
				<CreditCard
					size="24"
					color="{activeSection === 'cards' ? '#F2F2F0' : '#85889C'}" />
				<span>Cards</span>
			</button>
		</li>
		<li>
			<button
				class="w-full flex items-center gap-3 p-3 rounded-lg
                       transition-colors
                    
						  {activeSection === 'notes'
					? 'text-osvauld-sideListTextActive bg-osvauld-fieldActive'
					: ''}"
				on:click="{() => handleSectionChange('notes')}"
				aria-current="{activeSection === 'notes' ? 'page' : undefined}">
				<NoteIcon color="{activeSection === 'notes' ? '#F2F2F0' : '#85889C'}" />
				<span>Notes</span>
			</button>
		</li>
		<li>
			<button
				class="w-full flex items-center gap-3 p-3 rounded-lg
                       transition-colors
                     
						  {activeSection === 'contacts'
					? 'text-osvauld-sideListTextActive bg-osvauld-fieldActive'
					: ''}"
				on:click="{() => handleSectionChange('contacts')}"
				aria-current="{activeSection === 'contacts' ? 'page' : undefined}">
				<ContactIcon
					color="{activeSection === 'contacts' ? '#F2F2F0' : '#85889C'}" />
				<span>Contacts</span>
			</button>
		</li>
		<li>
			<button
				class="w-full flex items-center gap-3 p-3 rounded-lg
                       transition-colors
                      
						  {activeSection === 'bank'
					? 'text-osvauld-sideListTextActive bg-osvauld-fieldActive'
					: ''}"
				on:click="{() => handleSectionChange('bank')}"
				aria-current="{activeSection === 'bank' ? 'page' : undefined}">
				<BankIcon color="{activeSection === 'bank' ? '#F2F2F0' : '#85889C'}" />
				<span>Bank Accounts</span>
			</button>
		</li>
		<li>
			<button
				class="w-full flex items-center gap-3 p-3 rounded-lg
                       transition-colors
                       
						  {activeSection === 'wallets'
					? 'text-osvauld-sideListTextActive bg-osvauld-fieldActive'
					: ''}"
				on:click="{() => handleSectionChange('wallets')}"
				aria-current="{activeSection === 'wallets' ? 'page' : undefined}">
				<WalletIcon
					color="{activeSection === 'wallets' ? '#F2F2F0' : '#85889C'}" />
				<span>Digital Wallets</span>
			</button>
		</li>
		<li>
			<button
				class="w-full flex items-center gap-3 p-3 rounded-lg
                       transition-colors
                     
						  {activeSection === 'socials'
					? 'text-osvauld-sideListTextActive bg-osvauld-fieldActive'
					: ''}"
				on:click="{() => handleSectionChange('socials')}"
				aria-current="{activeSection === 'socials' ? 'page' : undefined}">
				<OldKey color="{activeSection === 'socials' ? '#F2F2F0' : '#85889C'}" />
				<span>Social Medias</span>
			</button>
		</li>
		<li>
			<button
				class="w-full flex items-center gap-3 p-3 rounded-lg
                       transition-colors
                       
						  {activeSection === 'ssh'
					? 'text-osvauld-sideListTextActive bg-osvauld-fieldActive'
					: ''}"
				on:click="{() => handleSectionChange('ssh')}"
				aria-current="{activeSection === 'ssh' ? 'page' : undefined}">
				<ApiIcon color="{activeSection === 'ssh' ? '#F2F2F0' : '#85889C'}" />
				<span>SSH Keys</span>
			</button>
		</li>
	</ul>
</nav>
