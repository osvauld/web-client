<script lang="ts">
	import { addCliUser } from "../apis";
	import { getTokenAndBaseUrl, sendMessage } from "../helper";

	import { showAddCliDrawer } from "../store";
	import ClosePanel from "../../basic/icons/closePanel.svelte";

	let name = "";

	const createCliUser = async () => {
		const keys = await sendMessage("generateCliKeys", {
			username: name,
		});
		const payload = {
			name,
			deviceKey: keys.sign_public_key,
			encryptionKey: keys.enc_public_key,
		};
		await addCliUser(payload);
		const { baseUrl } = await getTokenAndBaseUrl();
		keys.base_url = baseUrl;
		console.log(btoa(JSON.stringify(keys)));

		showAddCliDrawer.set(false);
	};

	function autofocus(node: any) {
		node.focus();
	}

	const handleClose = () => {
		showAddCliDrawer.set(false);
	};
</script>

<form
	class="p-4 bg-osvauld-frameblack border border-osvauld-activeBorder rounded-3xl w-[32rem] h-[17rem] flex flex-col items-start justify-center gap-3"
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

	<label for="name" class="font-bold text-base text-osvauld-textActive"
		>Name:</label
	>
	<input
		id="name"
		type="text"
		use:autofocus
		required
		bind:value="{name}"
		class="py-1 rounded-md items-center text-base bg-osvauld-frameblack border-osvauld-iconblack w-[95%] h-10 mx-2 focus:border-osvauld-iconblack focus:ring-0 form-input"
		autocomplete="off"
	/>

	<div
		class="border-b border-osvauld-iconblack w-[calc(100%+2rem)] -translate-x-4"
	></div>

	<div class="flex justify-end items-center gap-6 w-full">
		<button
			class="text-osvauld-fadedCancel font-medium text-base"
			on:click|preventDefault="{handleClose}">Cancel</button
		>
		<button
			class="border border-osvauld-iconblack py-[5px] px-[15px] text-base font-normal text-osvauld-textActive rounded-md"
			type="submit"
			disabled="{name === ''}"
		>
			Add CLI User
		</button>
	</div>
</form>
