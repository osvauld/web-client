<script lang="ts">
	import { onMount } from "svelte";
	import { BlueClose } from "../icons";
	import { toastStore } from "../store";
	let closehovered = false;
	const triggerCloseEvent = () => {
		toastStore.set({ show: false, message: "", type: null });
	};
	onMount(() => {
		setTimeout(() => {
			triggerCloseEvent();
		}, 1000);
	});
</script>

<div
	class="fixed w-[20%] max-w-[30%] h-[12%] top-auto left-auto right-6 bottom-6 flex items-center justify-center px-4 py-5 my-2 rounded-lg bg-transparent font-normal text-xl !z-[1000] mr-4 mb-4"
>
	<div
		class="flex justify-center items-center rounded-xl border {$toastStore.type
			? 'border-osvauld-iconblack text-osvauld-chalkwhite '
			: 'border-osvauld-dangerRed text-osvauld-dangerRed'} font-normal text-xl px-5 py-4 my-2 bg-osvauld-cardshade"
	>
		<span class="text-base font-sans whitespace-nowrap">
			{$toastStore.message}!</span
		>
		<!-- <button
      class="border-0 hover:bg-osvauld-modalFieldActive rounded-lg justify-center items-center p-2 mx-3"
      on:click={triggerCloseEvent}
      on:mouseenter={() => (closehovered = true)}
      on:mouseleave={() => (closehovered = false)}
    >
      <BlueClose color={closehovered ? "#F2F2F0" : "#67697C"} /></button
    >
  </div> -->
	</div>
</div>
