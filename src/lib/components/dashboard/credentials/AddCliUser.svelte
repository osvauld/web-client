<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { scale } from "svelte/transition";
	import { addCliUser } from "../apis";
	import { getTokenAndBaseUrl, sendMessage } from "../helper";
	import { Tick, CopyIcon, Warning } from "../icons";
	import { showAddCliDrawer, toastStore } from "../store";
	import ClosePanel from "../../basic/icons/closePanel.svelte";

	let name = "";
	let userString = "";
	let userStringCopied = false;
	let timer;

	function autofocus(node: any) {
		node.focus();
	}

	const handleClose = () => {
		showAddCliDrawer.set(false);
	};

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(userString);
			userStringCopied = true;
		} catch (err) {
			console.error("Failed to copy: ", err);
			userStringCopied = false;
		}
	};

	const finishSetup = async () => {
		await copyToClipboard();
		if (timer) {
			clearTimeout(timer);
			showAddCliDrawer.set(false);
		}

		timer = setTimeout(() => {
			showAddCliDrawer.set(false);
			timer = null;
		}, 1500);
	};

	const createCliUser = async () => {
		const keys = await sendMessage("generateCliKeys", {
			username: name,
		});
		const payload = {
			name,
			deviceKey: keys.sign_public_key,
			encryptionKey: keys.enc_public_key,
		};
		const creatingUser = await addCliUser(payload);
		const { baseUrl } = await getTokenAndBaseUrl();
		keys.base_url = baseUrl;
		userString = btoa(JSON.stringify(keys));
		return creatingUser;
	};

	const handleKeyDown = async (event: KeyboardEvent) => {
		if (event.key === "Escape") {
			handleClose();
		}

		if (event.key === "Enter" && name.length !== 0) {
			const tryingToCreateUser = await createCliUser();
			if (tryingToCreateUser.success) {
				toastStore.set({
					show: tryingToCreateUser.success,
					message: tryingToCreateUser.message,
					type: true,
				});
			}
		}
	};

	onMount(async () => {
		window.addEventListener("keydown", handleKeyDown);
	});

	onDestroy(() => {
		window.removeEventListener("keydown", handleKeyDown);
	});
</script>

<form
	class="p-4 bg-osvauld-frameblack border border-osvauld-activeBorder rounded-3xl w-[32rem] h-[20rem] flex flex-col items-start justify-around"
	on:submit|preventDefault="{createCliUser}"
>
	<div class="flex justify-between items-center w-full">
		<span class="text-[21px] font-medium text-osvauld-quarzowhite"
			>Create Cli User</span
		>
		<button class="cursor-pointer p-2" on:click|preventDefault="{handleClose}">
			<ClosePanel />
		</button>
	</div>
	<div
		class="border-b border-osvauld-iconblack w-[calc(100%+2rem)] -translate-x-4"
	></div>

	<label for="name" class="font-light text-sm text-osvauld-textActive"
		>Name:</label
	>
	<input
		id="name"
		type="text"
		use:autofocus
		required
		bind:value="{name}"
		disabled="{userString.length !== 0}"
		class="py-1 rounded-md items-center text-base bg-osvauld-frameblack border-osvauld-iconblack w-[95%] h-10 mx-2 focus:border-osvauld-iconblack focus:ring-0 form-input"
		autocomplete="off"
	/>
	{#if userString.length !== 0}
		<div
			class=" w-[95%] font-normal text-base flex justify-start items-center border border-osvauld-iconblack bg-osvauld-fieldActive rounded-lg gap-3 p-2 mx-2"
		>
			<div class="justify-center items-center flex">
				<Warning />
			</div>
			<div class="text-osvauld-textActive text-left">
				Copy user key secret (info)
			</div>
		</div>
		<label for="name" class="font-light text-sm text-osvauld-textActive"
			>Copy the user string:
		</label>
		<div
			class="py-1 rounded-md items-center text-base text-osvauld-textActive bg-osvauld-frameblack border-osvauld-iconblack w-[95%] h-10 mx-2 text-ellipsis whitespace-nowrap overflow-hidden"
		>
			{userString}
		</div>
	{/if}
	<div
		class="border-b border-osvauld-iconblack w-[calc(100%+2rem)] -translate-x-4"
	></div>

	<div class="flex justify-end items-center gap-4 w-full">
		<button
			class="font-medium text-base py-[5px] px-[15px] rounded-md hover:bg-osvauld-cancelBackground hover:text-osvauld-quarzowhite text-osvauld-fadedCancel"
			on:click|preventDefault="{handleClose}">Cancel</button
		>
		{#if userString.length === 0}
			<button
				class="border border-osvauld-iconblack py-[5px] px-[15px] text-base font-normal text-osvauld-textActive rounded-md hover:border-osvauld-carolinablue hover:text-osvauld-frameblack hover:bg-osvauld-carolinablue"
				type="submit"
				disabled="{name === ''}"
				on:click|preventDefault="{createCliUser}"
			>
				Add CLI User
			</button>
		{:else}
			<button
				class="border border-osvauld-iconblack py-[5px] px-[15px] text-base font-normal text-osvauld-textActive rounded-md flex justify-between flex-nowrap gap-1"
				type="submit"
				on:click|preventDefault="{finishSetup}"
			>
				{#if userStringCopied}
					<span class="text-osvauld-tickGreen w-[7.5rem]">Copied</span>
				{:else}
					<span class="w-[7.5rem] whitespace-nowrap">Copy Secret info</span>
				{/if}
				{#if userStringCopied}
					<span in:scale>
						<Tick />
					</span>
				{:else}
					<CopyIcon color="{'#4D4F60'}" />
				{/if}
			</button>
		{/if}
	</div>
</form>
