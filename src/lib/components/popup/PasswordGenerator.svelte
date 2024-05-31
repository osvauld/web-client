<script lang="ts">
	import AlertOctagon from "../basic/icons/alertOctagon.svelte";
	import CheckVerified from "../basic/icons/checkVerified.svelte";

	let includeSpecialChars = false;
	let includeNumbers = false;
	let includeCapital = false;
	let passwordLength = 8;
	$: strengthSticker = passwordLength > 17;
</script>

<div
	class="w-full h-full flex justify-center items-center text-osvauld-quarzowhite box-border p-2">
	<div
		class="w-full border border-osvauld-iconblack rounded-xl bg-osvauld-cardshade text-osvauld-fieldText overflow-hidden">
		<div
			class="text-osvauld-fieldTextActive text-lg font-medium flex justify-center items-center flex-wrap min-h-[94px]">
			<span class="max-w-[80%] pt-3 pb-0 break-words">
				rmiqgfhsdfjghksjdhqwrmiqgfhsdfjghksjdhqwrmiqgfhsdfjghksjdhqwasd
			</span>
		</div>

		<div class="flex flex-col gap-2">
			<div class="flex flex-col mt-5 items-center">
				<div class="flex justify-between items-center gap-2">
					<label class="w-[9rem]" for="lengthSlider"
						>Character Length: {passwordLength}</label>
					{#if strengthSticker}
						<span class="flex justify-center items-center w-[6rem]"
							><CheckVerified /> Strong</span>
					{:else}
						<span class="flex justify-center items-center gap-1 w-[6rem]"
							><AlertOctagon /> Vulnerable</span>
					{/if}
				</div>
				<input
					type="range"
					id="lengthSlider"
					min="4"
					max="64"
					bind:value="{passwordLength}"
					class="slider w-[80%] my-3 mx-0 h-2 rounded-lg appearance-none cursor-pointer bg-osvauld-placeholderblack" />
			</div>
			<div class="border-b border-osvauld-iconblack w-[90%] translate-x-4">
			</div>
			<div class="flex items-center justify-between px-3">
				<span>Special characters (!&*)</span>
				<label
					for="specialChar"
					class="inline-flex items-center cursor-pointer">
					<span class="relative">
						<span
							class="block w-10 h-6 {includeSpecialChars
								? 'bg-osvauld-carolinablue'
								: 'bg-osvauld-placeholderblack'} rounded-full shadow-inner"
						></span>
						<span
							class="absolute block w-4 h-4 mt-1 ml-1 rounded-full shadow inset-y-0 left-0 focus-within:shadow-outline transform transition-transform duration-300 ease-in-out {includeSpecialChars
								? 'bg-osvauld-plainwhite translate-x-full'
								: 'bg-osvauld-chalkwhite'}">
							<input
								type="checkbox"
								id="specialChar"
								class="absolute opacity-0 w-0 h-0"
								bind:checked="{includeSpecialChars}" />
						</span>
					</span>
				</label>
			</div>
			<div class="border-b border-osvauld-iconblack w-[90%] translate-x-4">
			</div>
			<div class="flex items-center justify-between px-3">
				<span>Capital letters (A-Z)</span>
				<label for="capitals" class="inline-flex items-center cursor-pointer">
					<span class="relative">
						<span
							class="block w-10 h-6 {includeCapital
								? 'bg-osvauld-carolinablue'
								: 'bg-osvauld-placeholderblack'} rounded-full shadow-inner"
						></span>
						<span
							class="absolute block w-4 h-4 mt-1 ml-1 rounded-full shadow inset-y-0 left-0 focus-within:shadow-outline transform transition-transform duration-300 ease-in-out {includeCapital
								? 'bg-osvauld-plainwhite translate-x-full'
								: 'bg-osvauld-chalkwhite'}">
							<input
								type="checkbox"
								id="capitals"
								class="absolute opacity-0 w-0 h-0"
								bind:checked="{includeCapital}" />
						</span>
					</span>
				</label>
			</div>
			<div class="border-b border-osvauld-iconblack w-[90%] translate-x-4">
			</div>
			<div class="flex items-center justify-between px-3">
				<span>Include numbers (0-9)</span>
				<label for="numbers" class="inline-flex items-center cursor-pointer">
					<span class="relative">
						<span
							class="block w-10 h-6 {includeNumbers
								? 'bg-osvauld-carolinablue'
								: 'bg-osvauld-placeholderblack'} rounded-full shadow-inner"
						></span>
						<span
							class="absolute block w-4 h-4 mt-1 ml-1 rounded-full shadow inset-y-0 left-0 focus-within:shadow-outline transform transition-transform duration-300 ease-in-out {includeNumbers
								? 'bg-osvauld-plainwhite translate-x-full'
								: 'bg-osvauld-chalkwhite'}">
							<input
								type="checkbox"
								id="numbers"
								class="absolute opacity-0 w-0 h-0"
								bind:checked="{includeNumbers}" />
						</span>
					</span>
				</label>
			</div>
		</div>

		<div class="flex justify-end items-center gap-2 w-full pr-3 my-2">
			<button
				class="text-osvauld-fadedCancel rounded-md border border-osvauld-iconblack py-1 px-2"
				on:click|preventDefault="{() => {}}">Cancel</button>
			<button
				class="py-1 px-2 rounded-md bg-osvauld-carolinablue text-osvauld-frameblack"
				on:click|preventDefault="{() => {}}">Copy and Close</button>
		</div>
	</div>
</div>
