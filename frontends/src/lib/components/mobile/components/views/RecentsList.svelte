<script>
	import CreditCard from "../../../../../icons/creditCard.svelte";
	export let NUM_CREDS;
	const testArray = Array(NUM_CREDS).fill(null);
	import LL from "../../../../../i18n/i18n-svelte";
</script>

<ul
	class="px-1 text-mobile-textPrimary mx-2 grow overflow-y-auto scrollbar-thin">
	{#each testArray as _, index}
		<li
			key="{index}"
			class="border border-mobile-bgHighlight bg-mobile-bgSeconary rounded-lg my-3 px-3 py-2">
			<div class="flex">
				<span class="flex justify-center items-center"
					><CreditCard color="#85889C" /></span>
				<div class="flex flex-col pl-3 justify-center">
					<span class="text-base">{$LL.types.apicredentials()}</span>
					<span>0000 8888 0000 8888</span>
				</div>
			</div>
		</li>
	{/each}
</ul>
