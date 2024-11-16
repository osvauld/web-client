<script>
	import Add from "../../../../icons/add.svelte";
	import IndividualCard from "../ui/IndividualCard.svelte";
	export let Icon;

	const NUM_OF_CARDS = 0;
	const cards = Array(NUM_OF_CARDS).fill(null);
</script>

<div class="flex-1 flex flex-col overflow-hidden">
	<div
		class="flex-1 flex text-white font-bold px-16 pb-24 overflow-y-auto overflow-x-hidden scrollbar-thin {NUM_OF_CARDS !==
		0
			? 'items-start'
			: 'items-center'}">
		{#if NUM_OF_CARDS !== 0}
			<div
				class="px-0 py-6 w-full text-osvauld-textActive flex flex-wrap content-start gap-6">
				{#each cards as _}
					<IndividualCard />
				{/each}
			</div>
		{:else}
			<div
				class="mx-auto p-32 w-full max-w-[1240px] min-w-[500px] flex flex-col xl:flex-row items-center justify-between bg-osvauld-cardshade rounded-[40px] text-osvauld-textActive">
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
</div>
