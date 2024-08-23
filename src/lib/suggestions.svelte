<script lang="ts">
	import { onMount } from "svelte";

	onMount(async () => {
		// console.log("mounted");
	});
</script>

<div class="w-full h-[15rem] bg-osvauld-frameblack text-base text-white">
	<span class="font-extrabold text-2xl text-white pb-4">osvauld</span>
	<p class="mt-4 mb-3">Would you like to add this credential to osvauld?</p>
	<span class="flex gap-2 text-sm items-center mb-3"
		>Username: <p>tonyantony300@gmail.com</p></span
	>
	<span class="flex gap-2 text-sm items-center"
		>Password: <p class="flex items-center">***********</p></span
	>
	<div class="flex justify-between items-center mt-6">
		<button class="p-2 bg-red-600 flex justify-center items-center"
			>Later</button
		>
		<button class="p-2 bg-green-600 flex justify-center items-center"
			>Save</button
		>
	</div>
</div>
