<script lang="ts">
	import TopNavBar from "../sections/TopNavBar.svelte";
	import AddVault from "../views/VaultManager.svelte";
	import Categories from "../views/Categories.svelte";
</script>

<main
	class="w-screen h-screen bg-mobile-bgPrimary flex flex-col relative pt-[48px] pb-[60px] overflow-hidden">
	<TopNavBar />
	<Categories />
</main>
