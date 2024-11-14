<script>
	import Add from "../../../../icons/add.svelte";
	export let Icon;

	const numberOfCards = 0;
</script>

<div
	class=" text-white font-bold grow flex justify-center items-center px-16 pb-24">
	{#if numberOfCards !== 0}
		<span>many cards</span>
	{:else}
		<div
			class="p-32 w-full max-w-[1440px] min-w-[300px] flex flex-col lg:flex-row items-center justify-between bg-osvauld-cardshade rounded-[40px] text-osvauld-textActive">
			<Icon color="#A3A4B5" size="444" />
			<div class="flex flex-col items-start gap-10 py-20">
				<h3 class="text-4xl font-light">
					No Credit / Debit Cards <br /> added yet
				</h3>
				<p class="text-sm font-light">
					Securely store your credit and debit cards for <br /> quick access when
					ever you need them.
				</p>
				<button
					class="text-sm font-normal whitespace-nowrap flex justify-center items-center text-osvauld-frameblack bg-osvauld-buttonOrange rounded-md py-2.5 px-5"
					>Add your first card to get started.
					<Add color="#000" />
				</button>
			</div>
		</div>
	{/if}
</div>
