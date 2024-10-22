<script lang="ts">
	import { fly, scale } from "svelte/transition";
	import {
		Locked,
		Eye,
		Unlocked,
		ActiveCopy,
		ClosedEye,
		CopyIcon,
		Tick,
	} from "../icons";
	import { TOTP } from "totp-generator";

	import { onDestroy } from "svelte";

	import { sendMessage, writeToClipboard } from "../helper";
	import CircularProgressBar from "../../popup/components/CircularProgressBar.svelte";
	export let fieldName: string;
	export let fieldValue: string;
	export let fieldType = "sensitive";
	export let hoverEffect: boolean;
	let visibility = false;
	let decrypted = false;
	let decryptedValue: string | null = null;
	let copied = false;
	let totpToken: string | null = null;
	let timeRemaining = 0;
	let totpInterval: any;

	const decrypt = async () => {
		decryptedValue = await sendMessage("decryptField", fieldValue);
		decrypted = true;

		if (fieldType === "totp") {
			generateTotpToken();
		}
	};

	const generateTotpToken = () => {
		const now = Date.now();
		const { otp, expires } = TOTP.generate(decryptedValue || fieldValue);
		totpToken = otp;
		timeRemaining = Math.floor((expires - now) / 1000);

		if (totpInterval) {
			clearInterval(totpInterval);
		}

		totpInterval = setInterval(() => {
			const currentTime = Date.now();
			timeRemaining = Math.floor((expires - currentTime) / 1000);

			if (timeRemaining <= 0) {
				const newTotp = TOTP.generate(decryptedValue || fieldValue);
				totpToken = newTotp.otp;
				timeRemaining = Math.floor((newTotp.expires - currentTime) / 1000);
			}
		}, 1000);
	};

	const toggleVisibility = () => {
		visibility = !visibility;
		setTimeout(() => {
			visibility = false;
		}, 3000);
	};

	const copyToClipboard = async () => {
		if (decryptedValue === null) {
			return;
		}
		copied = true;
		await writeToClipboard(decryptedValue);
		setTimeout(() => {
			copied = false;
		}, 2000);
	};

	const lockCredential = async () => {
		decrypted = false;
		clearInterval(totpInterval);
		decryptedValue = null;
	};
	onDestroy(() => {
		if (totpInterval) {
			clearInterval(totpInterval);
		}
	});
</script>

<div class="mb-2 mr-1 max-w-full" in:fly out:fly>
	<div
		class="label block mb-2 text-left text-osvauld-dusklabel text-xs font-normal cursor-pointer whitespace-nowrap text-ellipsis"
	>
		{fieldName}
	</div>

	<div
		class="py-1 px-3 w-full flex justify-between items-center text-base {hoverEffect
			? 'text-osvauld-fieldTextActive bg-osvauld-fieldActive rounded-md '
			: 'text-osvauld-fieldText rounded-none border-b border-osvauld-darkLineSeperator'}"
	>
		<span
			class=" {fieldType === 'totp'
				? 'min-w-[80%] max-w-[80%] mr-6'
				: 'w-3/5'} flex justify-between items-center font-normal text-sm"
		>
			{#if fieldType === "totp" && decrypted}
				<span class="mr-4">{totpToken} </span>
				<CircularProgressBar counter="{timeRemaining}" />
			{:else}
				<span class="overflow-hidden whitespace-nowrap text-ellipsis"
					>{decrypted && visibility ? decryptedValue : "*".repeat(8)}</span
				>
			{/if}
		</span>
		{#if !decrypted}
			<button on:click|stopPropagation="{decrypt}">
				<Locked color="{hoverEffect ? '#89B4FA' : '#4D4F60'}" />
			</button>
		{:else}
			<div class="max-w-2/5 flex gap-2 items-center justify-end">
				{#if fieldType !== "totp"}
					<button on:click|stopPropagation="{lockCredential}">
						<Unlocked />
					</button>
					<button on:click|stopPropagation="{toggleVisibility}">
						{#if visibility}
							<ClosedEye />
						{:else}
							<Eye />
						{/if}
					</button>
				{/if}
				<button on:click|stopPropagation="{copyToClipboard}">
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
			</div>
		{/if}
	</div>
</div>

<!-- {#if fieldType === "totp" && decrypted}
	<div class="mt-2 text-xs text-osvauld-dusklabel">
		TOTP: {totpToken} <br />
		Time remaining: {timeRemaining}s
	</div>
{/if} -->
