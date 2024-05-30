<script lang="ts">
	let includeSpecialChars = false;
	let includeNumbers = false;
	let includeCapital = false;
	let passwordLength = 8;
</script>

<style>
	.slider-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 20px;
	}

	.slider {
		width: 80%;
		margin: 10px 0;
	}
</style>

<div
	class="w-full h-full flex justify-center items-center text-osvauld-quarzowhite box-border p-2">
	<div
		class="w-full border border-osvauld-iconblack rounded-xl bg-osvauld-cardshade text-osvauld-fieldText overflow-hidden">
		<div class="text-osvauld-fieldTextActive text-lg font-medium py-2 px-4">
			rmiq@q3qwQds45a@
		</div>

		<div class="flex flex-col gap-2">
			<div class="slider-container">
				<label for="lengthSlider">Password Length: {passwordLength}</label>
				<input
					type="range"
					id="lengthSlider"
					min="4"
					max="20"
					bind:value="{passwordLength}"
					class="slider" />
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
