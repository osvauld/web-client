<script lang="ts">
	import { fly } from "svelte/transition";
	import { promptPassword } from "../store";
	import { ClosePanel } from "../icons";

	let password: string = "";

	const closeModal = () => {
		promptPassword.set(false);
	};

	const autofocus = (node: any) => {
		node.focus();
	};

	const handleSubmit = () => {
		console.log("password submitted,", password);
	};
</script>

<button
	class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
	on:click|preventDefault="{closeModal}"
>
	<form
		class="p-4 bg-osvauld-frameblack border border-osvauld-activeBorder rounded-3xl w-[24rem] h-[18rem]"
		in:fly
		out:fly
		on:submit|preventDefault="{handleSubmit}"
	>
		<div class="flex justify-between items-center w-full">
			<span class="text-[21px] font-medium text-osvauld-quarzowhite"
				>Confirm Master Password</span
			>
			<button
				class="cursor-pointer p-2"
				type="button"
				on:click|preventDefault="{closeModal}"
			>
				<ClosePanel />
			</button>
		</div>
		<div
			class="border-b border-osvauld-iconblack w-[calc(100%+2rem)] -translate-x-4"
		></div>
		<div class="">
			<input
				id="password"
				type="text"
				use:autofocus
				required
				bind:value="{password}"
				class="py-1 rounded-sm items-center text-base bg-osvauld-frameblack border-osvauld-iconblack w-[95%] h-10 mx-2 focus:border-osvauld-iconblack focus:ring-0 form-input"
				autocomplete="off"
			/>

			<button
				class="border border-osvauld-iconblack w-[10rem] h-[1.5rem] py-3 px-6 text-base font-medium text-osvauld-textActive rounded-md hover:bg-osvauld-carolinablue hover:border-osvauld-carolinablue hover:text-osvauld-frameblack"
				type="submit"
				disabled="{!password}">Proceed</button
			>
		</div>
	</form>
</button>
