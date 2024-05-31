<script lang="ts">
	import { scale } from "svelte/transition";
	import AlertOctagon from "../basic/icons/alertOctagon.svelte";
	import CheckVerified from "../basic/icons/checkVerified.svelte";
	import Tick from "../basic/icons/tick.svelte";
	import Crown from "../basic/icons/crown.svelte";
	import ShieldCheck from "../basic/icons/shieldCheck.svelte";
	import CopyIcon from "../basic/icons/copyIcon.svelte";
	import Refresh from "../basic/icons/refresh.svelte";
	import ActiveCopy from "../basic/icons/activeCopy.svelte";
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	let includeSpecialChars = false;
	let includeNumbers = true;
	let includeCapital = true;
	let passwordLength = 14;
	let generatedPassword = "";
	let entropy = null;
	let copied = false;
	let hoverEffect = false;
	let strengthSticker: string = "";
	let rotationDegree: number = 0;
	const specialChars = "!#%+:=?@";
	const numbers = "0123456789";
	const lowerCase = "abcdefghijklmnopqrstuvwxyz";
	const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	function calculateEntropy(password: string): number {
		let N = lowerCase.length;

		if (includeSpecialChars) N += specialChars.length;
		if (includeNumbers) N += numbers.length;
		if (includeCapital) N += upperCase.length;

		const L = password.length;
		entropy = Math.log2(N ** L);
		return entropy;
	}

	function setStrengthSticker(password: string): void {
		const entropy = calculateEntropy(password);
		if (entropy < 40) {
			strengthSticker = "Weak";
		} else if (entropy < 130) {
			strengthSticker = "Fair";
		} else if (entropy < 250) {
			strengthSticker = "Strong";
		} else {
			strengthSticker = "Chad";
		}
		console.log("Entropy:", entropy, "bits", "Strength:", strengthSticker);
	}

	function shuffleString(str: string): string {
		let array = str.split("");
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(
				crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1),
			);
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array.join("");
	}

	function generatePassword(
		passwordLength,
		includeSpecialChars,
		includeNumbers,
		includeCapital,
	) {
		let allChars = lowerCase;
		let mandatoryChars = "";
		if (includeSpecialChars) {
			allChars += specialChars;
			mandatoryChars += specialChars.charAt(
				crypto.getRandomValues(new Uint32Array(1))[0] % specialChars.length,
			);
		}
		if (includeNumbers) {
			allChars += numbers;
			mandatoryChars += numbers.charAt(
				crypto.getRandomValues(new Uint32Array(1))[0] % numbers.length,
			);
		}
		if (includeCapital) {
			allChars += upperCase;
			mandatoryChars += upperCase.charAt(
				crypto.getRandomValues(new Uint32Array(1))[0] % upperCase.length,
			);
		}

		let array = new Uint32Array(passwordLength - mandatoryChars.length);
		crypto.getRandomValues(array);
		let randomChars = Array.from(
			array,
			(num) => allChars[num % allChars.length],
		).join("");

		generatedPassword = shuffleString(mandatoryChars + randomChars);
		setStrengthSticker(generatedPassword);
	}

	$: {
		generatePassword(
			passwordLength,
			includeSpecialChars,
			includeNumbers,
			includeCapital,
		);
	}

	const copyToClipboard = async (e) => {
		copied = true;
		try {
			await navigator.clipboard.writeText(generatedPassword);
		} catch (err) {
			console.error("Failed to copy: ", err);
		}
		setTimeout(() => {
			copied = false;
		}, 2000);
	};

	const regenerationHandler = () => {
		rotationDegree += 180;
		setTimeout(() => {
			generatePassword(
				passwordLength,
				includeSpecialChars,
				includeNumbers,
				includeCapital,
			);
		}, 350);
	};

	const handleCancel = () => {
		dispatch("close", true);
	};
</script>

<style>
	.rotate-custom {
		transform: rotate(var(--rotation-deg, 0deg));
	}
</style>

<div
	class="w-full h-full flex justify-center items-center text-osvauld-quarzowhite box-border p-2"
>
	<div
		class="w-full border border-osvauld-iconblack rounded-xl bg-osvauld-cardshade text-osvauld-fieldText overflow-hidden"
	>
		<div
			class="text-osvauld-fieldTextActive text-lg font-medium flex justify-center items-center flex-wrap min-h-[120px] relative"
		>
			<span class="max-w-[80%] pt-3 pb-0 break-words">{generatedPassword}</span>
			<div class="absolute bottom-1 right-10 flex gap-2">
				<button
					on:click|preventDefault|stopPropagation="{copyToClipboard}"
					on:mouseenter="{() => (hoverEffect = true)}"
					on:mouseleave="{() => (hoverEffect = false)}"
				>
					{#if copied}
						<span in:scale>
							<Tick />
						</span>
					{:else if hoverEffect}
						<ActiveCopy />
					{:else}
						<CopyIcon color="{'#4D4F60'}" />
					{/if}
				</button>
				<button
					on:click|stopPropagation="{regenerationHandler}"
					class="transition-transform duration-300 ease-in rotate-custom"
					style="--rotation-deg: {rotationDegree}deg;"><Refresh /></button
				>
			</div>
		</div>
		<div class="border-b border-osvauld-iconblack w-[90%] translate-x-4"></div>

		<div class="flex flex-col gap-2">
			<div class="flex flex-col mt-5 items-center">
				<div class="flex justify-between items-center gap-2">
					<label class="w-[9rem]" for="lengthSlider"
						>Length {passwordLength}</label
					>
					{#if strengthSticker === "Chad"}
						<span class="flex justify-center items-center gap-1 w-[6rem]"
							><Crown /> Chad</span
						>
					{:else if strengthSticker === "Strong"}
						<span class="flex justify-center items-center gap-1 w-[6rem]"
							><ShieldCheck />Very Strong</span
						>
					{:else if strengthSticker === "Fair"}
						<span class="flex justify-center items-center w-[6rem]"
							><CheckVerified /> Strong</span
						>
					{:else}
						<span class="flex justify-center items-center gap-1 w-[6rem]"
							><AlertOctagon /> Weak</span
						>
					{/if}
				</div>
				<input
					type="range"
					id="lengthSlider"
					min="4"
					max="56"
					bind:value="{passwordLength}"
					class="slider w-[80%] my-3 mx-0 h-2 rounded-lg appearance-none cursor-pointer bg-osvauld-placeholderblack"
				/>
			</div>
			<div
				class="border-b border-osvauld-iconblack w-[90%] translate-x-4"
			></div>
			<div class="flex items-center justify-between px-3">
				<span>Special characters (!&*)</span>
				<label
					for="specialChar"
					class="inline-flex items-center cursor-pointer"
				>
					<span class="relative">
						<span
							class="block w-10 h-6 {includeSpecialChars
								? 'bg-osvauld-carolinablue'
								: 'bg-osvauld-placeholderblack'} rounded-full shadow-inner"
						></span>
						<span
							class="absolute block w-4 h-4 mt-1 ml-1 rounded-full shadow inset-y-0 left-0 focus-within:shadow-outline transform transition-transform duration-300 ease-in-out {includeSpecialChars
								? 'bg-osvauld-plainwhite translate-x-full'
								: 'bg-osvauld-chalkwhite'}"
						>
							<input
								type="checkbox"
								id="specialChar"
								class="absolute opacity-0 w-0 h-0"
								bind:checked="{includeSpecialChars}"
							/>
						</span>
					</span>
				</label>
			</div>
			<div
				class="border-b border-osvauld-iconblack w-[90%] translate-x-4"
			></div>
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
								: 'bg-osvauld-chalkwhite'}"
						>
							<input
								type="checkbox"
								id="capitals"
								class="absolute opacity-0 w-0 h-0"
								bind:checked="{includeCapital}"
							/>
						</span>
					</span>
				</label>
			</div>
			<div
				class="border-b border-osvauld-iconblack w-[90%] translate-x-4"
			></div>
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
								: 'bg-osvauld-chalkwhite'}"
						>
							<input
								type="checkbox"
								id="numbers"
								class="absolute opacity-0 w-0 h-0"
								bind:checked="{includeNumbers}"
							/>
						</span>
					</span>
				</label>
			</div>
		</div>

		<div class="flex justify-start items-center w-full pl-3 my-2">
			<button
				class="text-osvauld-fadedCancel rounded-md border border-osvauld-iconblack py-1 px-2"
				on:click|preventDefault="{handleCancel}">Cancel</button
			>
		</div>
	</div>
</div>
