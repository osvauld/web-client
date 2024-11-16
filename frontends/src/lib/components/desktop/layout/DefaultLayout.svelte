<script lang="ts">
	import ContentWrapper from "../sections/ContentWrapper.svelte";
	import HeaderSection from "../sections/HeaderSection.svelte";
	import NavigationPanel from "../sections/NavigationPanel.svelte";
</script>

<div class="w-full h-full bg-osvauld-primaryBg flex flex-col overflow-hidden">
	<HeaderSection />
	<div class="grow flex overflow-hidden">
		<NavigationPanel />
		<ContentWrapper />
	</div>
</div>
