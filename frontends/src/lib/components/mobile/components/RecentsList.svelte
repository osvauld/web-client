<script>
	import CreditCard from "../../basic/icons/creditCard.svelte";
	import DownArrow from "../../basic/icons/mobileDownArrow.svelte";
	const testArray = Array(6).fill(null);
	export let isRecentsVisible = true;
	import LL from "../../../../i18n/i18n-svelte";
</script>

<button
	class="px-3 h-[40px] flex justify-between items-center active:bg-mobile-bgHighlight/10"
	on:click="{() => (isRecentsVisible = !isRecentsVisible)}">
	<span class="text-mobile-textSecondary">Recents</span>
	<span
		class="transition-transform duration-200"
		style="transform: rotate({isRecentsVisible ? 0 : -90}deg)">
		<DownArrow />
	</span>
</button>

{#if isRecentsVisible}
	<ul
		class="px-1 text-mobile-textPrimary max-h-[240px] overflow-y-auto scrollbar-thin mx-2">
		{#each testArray as card, index}
			<li
				key="{index}"
				class="border border-mobile-bgHighlight bg-mobile-bgSeconary rounded-lg my-3 px-3 py-2">
				<div class="flex">
					<span class="flex justify-center items-center"
						><CreditCard color="#85889C" /></span>
					<div class="flex flex-col pl-3 justify-center">
						<span class="text-base">Credit Card</span>
						<span>0000 8888 0000 8888</span>
					</div>
				</div>
			</li>
		{/each}
	</ul>
{/if}
