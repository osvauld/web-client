<script>
	import OsvauldDesktopLogo from "../../../icons/osvauldDesktopLogo.svelte";
	import Lens from "../../../icons/lens.svelte";
	import Profile from "../../../icons/profile.svelte";
	import { profileModal } from "../store/desktop.ui.store";
	import { LL } from "../../../i18n/i18n-svelte";
</script>

<div class="h-32 w-full border-b border-osvauld-borderColor flex">
	<span class="basis-[360px] shrink-0 h-full flex items-center justify-center">
		<OsvauldDesktopLogo />
	</span>
	<div class="grow py-10 px-16 flex items-center justify-end gap-6">
		<div
			class="flex h-12 w-full min-w-[400px] max-w-2xl items-center bg-osvauld-frameblack py-2.5 px-3 rounded-lg">
			<span class="sr-only">Search</span>
			<Lens color="#4D4F60" />
			<input
				type="text"
				name="search"
				class="grow border-0 focus:ring-0 outline-0 bg-osvauld-frameblack text-osvauld-activeBorder placeholder:text-osvauld-activeBorder font-light text-base leading-6"
				placeholder="{$LL.search()}" />
		</div>
		<button
			aria-label="Open Profile View"
			class="p-3 rounded-lg bg-osvauld-frameblack"
			on:click="{() => profileModal.set(true)}">
			<Profile color="#4D4F60" />
		</button>
	</div>
</div>
