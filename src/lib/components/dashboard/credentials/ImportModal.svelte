<script lang="ts">
	import { fly } from "svelte/transition";
	import { onMount, createEventDispatcher } from "svelte";
	import Close from "../../basic/icons/closePanel.svelte";
	import {
		parseCsvLogins,
		approvedCredentialSubmit,
	} from "../credentialParser";
	import { IntermediateCredential, Platform } from "../../../dtos/import.dto";
	import Import from "../../basic/icons/import.svelte";
	import ImportTable from "./ImportTable.svelte";
	import ImportLoader from "../../basic/ImportLoader.svelte";
	import ImportMessage from "../../basic/ImportMessage.svelte";
	import SuccessView from "../../basic/SuccessView.svelte";
	let selectedPlatform: Platform;
	let isOptionSelected: boolean = false;
	let loadingScreen: boolean = false;
	let loadingSuccess: boolean = false;
	let loadingFail: boolean = false;
	let processingScreen: boolean = false;
	let processingSuccess: boolean = false;
	let isImportSuccessful: boolean = false;

	let dataFromParser: IntermediateCredential[];

	const dispatch = createEventDispatcher();

	const options = [
		"chrome",
		"firefox",
		"safari",
		"edge",
		"opera",
		"bitwarden",
		"protonpass",
		"dashlane",
		"1password",
		"nordpass",
		"passbolt",
		"keepass",
		"lastpass",
		"kaspersky",
		"roboform",
	];

	const getImagePath = (option: string) => `/icons/import/${option}.png`;

	const dispatchCancel = () => {
		dispatch("close");
	};

	let fileInput: HTMLInputElement | null = null;

	function triggerFileInput() {
		if (fileInput) {
			fileInput.click();
		}
	}

	function handleFileSelect(event: Event): void {
		const input = event.target as HTMLInputElement;
		const file = input?.files?.[0];
		if (file) {
			loadingScreen = true;
			parseCsvLogins(file, selectedPlatform)
				.then((intermediateData) => {
					if (intermediateData.length === 0) {
						loadingFail = true;
						setTimeout(() => {
							dispatch("close");
						}, 1500);
					} else {
						dataFromParser = intermediateData;
						loadingSuccess = true;
					}
				})
				.catch((error) => {
					console.error("Error parsing credentials:", error);
					loadingFail = true;
					setTimeout(() => {
						dispatch("close");
					}, 1500);
				});
		}
	}

	const handleKeyboardEvent = (event: KeyboardEvent) => {
		if (event.key === "Escape") {
			dispatch("close");
		}
	};

	const handleSelectedOption = (option: string) => {
		selectedPlatform = option.charAt(0).toUpperCase() + option.slice(1);
		isOptionSelected = true;
	};

	const handleSelectedCredentials = async (e: CustomEvent) => {
		processingScreen = true;
		setTimeout(() => {
			processingSuccess = isImportSuccessful;
			setTimeout(() => {
				dispatch("close");
			}, 1500);
		}, 4000);
		isImportSuccessful = await approvedCredentialSubmit(e.detail);
	};

	onMount(async () => {
		window.addEventListener("keydown", handleKeyboardEvent);
	});
</script>

<div
	class="z-50 rounded-xl blur-none w-[64rem] max-w-[80vw] h-[42rem] shadow-xl translate-x-0 bg-osvauld-frameblack py-6 px-3 overflow-hidden"
	in:fly
	out:fly
>
	{#if loadingScreen}
		<div class="text-3xl my-4 flex justify-center px-4">
			<span class="ml-auto">Import from {selectedPlatform}</span>
			<button class=" px-1.5 py-1.5 ml-auto" on:click="{dispatchCancel}"
				><Close size="{32}" /></button
			>
		</div>
		<div
			class="w-full h-[85%] flex flex-col justify-center items-center text-osvauld-chalkwhite text-xl"
		>
			{#if processingSuccess}
				<SuccessView status="{isImportSuccessful}" />
			{:else if processingScreen}
				<ImportLoader />
				<ImportMessage />
			{:else if loadingSuccess}
				<ImportTable
					{dataFromParser}
					on:approved="{handleSelectedCredentials}"
				/>
			{:else if loadingFail}
				<span class="text-red-400 font-semibold text-2xl"
					>Error parsing credentials</span
				>
			{:else}
				<span>Loading...</span>
			{/if}
		</div>
	{:else if isOptionSelected}
		<div class="text-3xl my-4 flex justify-center">
			<span class="">Import from {selectedPlatform}</span>
		</div>
		<input
			bind:this="{fileInput}"
			type="file"
			accept=".csv"
			on:change="{handleFileSelect}"
			style="display: none;"
		/>

		<button
			class="w-full h-[80%] flex flex-col justify-center items-center text-osvauld-chalkwhite text-xl"
			on:click="{triggerFileInput}"
		>
			<span class="cursor-pointer mb-10"><Import size="{128}" /></span>
			<p>Select your file here</p>
			<p class="text-osvauld-sheffieldgrey text-lg mt-3">
				File Types supported: CSV
			</p>
		</button>
		<div class="flex justify-end items-center pr-10">
			<button
				class="border border-osvauld-iconblack rounded-lg px-3 py-1.5 hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack"
				on:click="{dispatchCancel}">Cancel</button
			>
		</div>
	{:else}
		<div class="text-3xl my-4 flex justify-center">
			<span class="">Select Import Target</span>
		</div>
		<div
			class="w-full h-[80%] gap-2 grid grid-cols-4 grid-rows-4 text-osvauld-chalkwhite text-xl"
		>
			{#each options as option}
				<button
					class="border border-osvauld-iconblack rounded-lg
						hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack
							transition-all duration-300 ease-in-out
							capitalize object-contain object-center overflow-hidden flex justify-center items-center p-2"
					on:click="{() => handleSelectedOption(option)}"
				>
					<img
						src="{getImagePath(option)}"
						class="max-w-full max-h-full"
						alt="{option}"
					/>
				</button>
			{/each}
		</div>
		<div class="flex justify-end items-center pr-10">
			<button
				class="border border-osvauld-iconblack rounded-lg px-3 py-1.5 hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack"
				on:click="{dispatchCancel}">Cancel</button
			>
		</div>
	{/if}
</div>
