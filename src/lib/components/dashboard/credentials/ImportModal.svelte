<script lang="ts">
	import { fly } from "svelte/transition";
	import { onMount, createEventDispatcher } from "svelte";
	import Import from "../../basic/icons/import.svelte";
	const dispatch = createEventDispatcher();

	let selectedPlatform: string = "";
	let isOptionSelected: boolean = false;

	const dispatchCancel = () => {
		dispatch("close");
	};

	let fileInput;

	function triggerFileInput() {
		fileInput.click();
	}

	function handleFileSelect(event) {
		const file = event.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const contents = e.target.result;
				// dispatch("fileimported", { contents, filename: file.name });

				console.log({ contents, filename: file.name });
				// Need to show loading scrren while data being processed
			};
			reader.readAsText(file);
		}

		// else {
		// 	alert("Please select a CSV file.");
		// }
		// // Reset the file input so the same file can be selected again if needed
		// event.target.value = "";
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

	onMount(async () => {
		window.addEventListener("keydown", handleKeyboardEvent);
	});
</script>

<div
	class="z-50 rounded-xl blur-none w-[64rem] max-w-[80vw] h-[42rem] shadow-xl translate-x-0 bg-osvauld-frameblack py-6 px-3 overflow-hidden"
	in:fly
	out:fly
>
	{#if isOptionSelected}
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
			<p>Select your exported file from {selectedPlatform}</p>
		</button>
	{:else}
		<div class="text-3xl my-4 flex justify-center">
			<span class="">Select Import Target</span>
		</div>
		<div
			class="w-full h-[80%] gap-2 grid grid-cols-4 grid-rows-4 text-osvauld-chalkwhite text-xl"
		>
			<button
				class="hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack"
				on:click="{() => {
					handleSelectedOption('chrome');
				}}">Chrome</button
			>
			<button
				class="hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack"
				on:click="{() => {
					handleSelectedOption('firefox');
				}}">Firefox</button
			>
			<button
				class="hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack"
				on:click="{() => {
					handleSelectedOption('safari');
				}}">Safari</button
			>
			<button
				class="hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack"
				on:click="{() => {
					handleSelectedOption('edge');
				}}">Edge</button
			>
			<button
				class="hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack"
				on:click="{() => {
					handleSelectedOption('opera');
				}}">Opera</button
			>
			<button
				class="hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack"
				on:click="{() => {
					handleSelectedOption('bitwarden');
				}}">Bitwarden</button
			>
			<button
				class="hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack"
				on:click="{() => {
					handleSelectedOption('dashlane');
				}}">Dashlane</button
			>
			<button
				class="hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack"
				on:click="{() => {
					handleSelectedOption('1password');
				}}">1Password</button
			>
			<button
				class="hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack"
				on:click="{() => {
					handleSelectedOption('nordpass');
				}}">NordPass</button
			>
			<button
				class="hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack"
				on:click="{() => {
					handleSelectedOption('passbolt');
				}}">Passbolt</button
			>
			<button
				class="hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack"
				on:click="{() => {
					handleSelectedOption('keepass');
				}}">KeePass</button
			>
			<button
				class="hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack"
				on:click="{() => {
					handleSelectedOption('lastpass');
				}}">LastPass</button
			>
			<button
				class="hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack"
				on:click="{() => {
					handleSelectedOption('kaspersky');
				}}">Kaspersky</button
			>
			<button
				class="hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack"
				on:click="{() => {
					handleSelectedOption('roboform');
				}}">Roboform</button
			>
		</div>
	{/if}
	<div class="flex justify-end items-center pr-10">
		<button
			class="border border-osvauld-iconblack rounded-lg px-3 py-1.5 hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack"
			on:click="{dispatchCancel}">Cancel</button
		>
	</div>
</div>
