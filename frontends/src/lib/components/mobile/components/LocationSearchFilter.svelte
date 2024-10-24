<script lang="ts">
	import Filter from "../../basic/icons/filter.svelte";
	import Lens from "../../basic/icons/lens.svelte";
	import Options from "../../basic/icons/options.svelte";
	export let currentVault = "All";
</script>

<div class="fixed w-full top-0 h-[48px] flex justify-between items-center px-4">
	<div class="text-2xl text-mobile-textPrimary font-semibold">
		{currentVault === "All" ? "Home" : currentVault}
	</div>
	<div class="flex gap-4">
		<span><Lens color="#85889C" size="24" /></span>
		<span><Filter color="#85889C" /></span>
		<span><Options color="#85889C" /></span>
	</div>
</div>
