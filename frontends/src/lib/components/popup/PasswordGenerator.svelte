<script lang="ts">
	import { scale } from "svelte/transition";
	import RangeSlider from "./components/RangeSlider.svelte";
	import AlertOctagon from "../../../icons/alertOctagon.svelte";
	import CheckVerified from "../../../icons/checkVerified.svelte";
	import Tick from "../../../icons/tick.svelte";
	import Crown from "../../../icons/crown.svelte";
	import ShieldCheck from "../../../icons/shieldCheck.svelte";
	import CopyIcon from "../../../icons/copyIcon.svelte";
	import Refresh from "../../../icons/refresh.svelte";
	import ActiveCopy from "../../../icons/activeCopy.svelte";
	import { createEventDispatcher } from "svelte";
	import { writeToClipboard } from "../dashboard/helper";

	const dispatch = createEventDispatcher();

	let includeSpecialChars = false;
	let includeNumbers = true;
	let includeCapital = true;
	let passwordLength: number = 16;
	let generatedPassword = "";
	let entropy: number;
	let copied = false;
	let hoverEffect = false;
	let strengthSticker: string = "";
	let rotationDegree: number = 0;

	const specialChars = "!#$%&()*+,-.:;<=>?@[]^_{|}~";
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
		} else if (entropy < 80) {
			strengthSticker = "Fair";
		} else if (entropy < 120) {
			strengthSticker = "Strong";
		} else if (entropy < 280) {
			strengthSticker = "Very Strong";
		} else {
			strengthSticker = "Chad";
		}
	}

	function shuffleString(str: string): string {
		// The Fisher-Yates (Knuth) shuffle algorithm
		let array = str.split("");
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(
				crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1),
			);
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array.join("");
	}

	const generatePassword = (
		passwordLength: number,
		includeSpecialChars: boolean,
		includeNumbers: boolean,
		includeCapital: boolean,
	) => {
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
	};

	$: {
		generatePassword(
			passwordLength,
			includeSpecialChars,
			includeNumbers,
			includeCapital,
		);
	}

	const copyToClipboard = async () => {
		copied = true;
		await writeToClipboard(generatedPassword);
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
	class="w-full h-full flex justify-center items-start text-osvauld-quarzowhite box-border">
	<div
		class="w-full h-full rounded-xl bg-osvauld-cardshade text-osvauld-fieldText">
		<div class="px-3 py-2">
			<span class="text-osvauld-fieldText font-light text-xs"
				>Generated Password</span>
			<div
				class="text-osvauld-fieldTextActive flex justify-between items-center gap-2">
				<div
					class="bg-osvauld-fieldActive rounded-md text-sm p-2 font-semibold text-osvauld-fieldText break-all min-w-[85%] max-w-[85%] min-h-[70px] max-h-[70px]">
					{generatedPassword}
				</div>
				<div class="flex flex-col justify-between items-center gap-2 pr-2">
					<button
						on:click|preventDefault|stopPropagation="{copyToClipboard}"
						on:mouseenter="{() => (hoverEffect = true)}"
						on:mouseleave="{() => (hoverEffect = false)}">
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
						style="--rotation-deg: {rotationDegree}deg;"><Refresh /></button>
				</div>
			</div>
		</div>
		<div class="border-b border-osvauld-iconblack w-[90%] translate-x-4 my-3">
		</div>

		<div class="flex flex-col gap-2">
			<div class="flex flex-col gap-2 mt-5 items-center">
				<div class="flex justify-between items-center gap-2 w-[90%]">
					<label class="w-[9rem]" for="lengthSlider"
						>Entropy : {Math.floor(entropy)} bits</label>
					{#if strengthSticker === "Chad"}
						<span class="flex justify-end items-center gap-1 w-[6rem]"
							>Chad <Crown />
						</span>
					{:else if strengthSticker === "Very Strong"}
						<span
							class="flex justify-end items-center gap-1 w-[6rem] text-[#A6E3A1]"
							>Very Strong <ShieldCheck /></span>
					{:else if strengthSticker === "Strong"}
						<span
							class="flex justify-end items-center gap-1 w-[6rem] text-[#A6E3A1]"
							>Strong <ShieldCheck /></span>
					{:else if strengthSticker === "Fair"}
						<span class="flex justify-end items-center w-[6rem]"
							>Fair<CheckVerified /></span>
					{:else}
						<span
							class="flex justify-end items-center gap-1 w-[6rem] text-[#FF6A6A]"
							>Weak<AlertOctagon /></span>
					{/if}
				</div>
				<div class="w-[90%]">
					<RangeSlider on:change="{(e) => (passwordLength = e.detail.value)}" />
				</div>
			</div>
			<div class="border-b border-osvauld-iconblack w-[90%] translate-x-4 my-1">
			</div>
			<div
				class="flex items-center justify-between px-4 text-osvauld-quarzowhite">
				<span class="">Special characters (!&*)</span>
				<label
					for="specialChar"
					class="inline-flex items-center cursor-pointer">
					<span class="relative">
						<span
							class="block w-[36px] h-[1.25rem] {includeSpecialChars
								? 'bg-osvauld-carolinablue'
								: 'bg-osvauld-placeholderblack'} rounded-full shadow-inner"
						></span>
						<span
							class="absolute block w-4 h-4 mt-0.5 ml-0.5 rounded-full shadow inset-y-0 left-0 focus-within:shadow-outline transform transition-transform duration-300 ease-in-out {includeSpecialChars
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
			<div class="border-b border-osvauld-iconblack w-[90%] translate-x-4 my-1">
			</div>
			<div
				class="flex items-center justify-between px-4 text-osvauld-quarzowhite">
				<span>Capital letters (A-Z)</span>
				<label for="capitals" class="inline-flex items-center cursor-pointer">
					<span class="relative">
						<span
							class="block w-[36px] h-[1.25rem] {includeCapital
								? 'bg-osvauld-carolinablue'
								: 'bg-osvauld-placeholderblack'} rounded-full shadow-inner"
						></span>
						<span
							class="absolute block w-4 h-4 mt-0.5 ml-0.5 rounded-full shadow inset-y-0 left-0 focus-within:shadow-outline transform transition-transform duration-300 ease-in-out {includeCapital
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
			<div class="border-b border-osvauld-iconblack w-[90%] translate-x-4 my-1">
			</div>
			<div
				class="flex items-center justify-between px-4 text-osvauld-quarzowhite">
				<span>Numbers (0-9)</span>
				<label for="numbers" class="inline-flex items-center cursor-pointer">
					<span class="relative">
						<span
							class="block w-[36px] h-[1.25rem] {includeNumbers
								? 'bg-osvauld-carolinablue'
								: 'bg-osvauld-placeholderblack'} rounded-full shadow-inner"
						></span>
						<span
							class="absolute block w-4 h-4 mt-0.5 ml-0.5 rounded-full shadow inset-y-0 left-0 focus-within:shadow-outline transform transition-transform duration-300 ease-in-out {includeNumbers
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
			<div
				class="border-b border-osvauld-iconblack w-[90%] translate-x-4 my-1.5">
			</div>
		</div>

		<div class="mt-[6rem] flex justify-start items-center w-full pl-3 my-2">
			<button
				class=" rounded-md border border-osvauld-iconblack py-1 px-2"
				on:click|preventDefault="{handleCancel}">Cancel</button>
		</div>
	</div>
</div>
