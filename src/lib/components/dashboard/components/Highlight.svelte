<script lang="ts">
	export let text = "";
	export let query = "";

	$: parts =
		query.length >= 3
			? highlightMatch(text, query)
			: [{ text, highlight: false }];

	function highlightMatch(text, query) {
		const regex = new RegExp(`(${query})`, "gi");
		const parts = text.split(regex);
		return parts.map((part) =>
			regex.test(part)
				? { text: part, highlight: true }
				: { text: part, highlight: false },
		);
	}
</script>

{#each parts as part}
	{#if part.highlight}
		<span class="bg-osvauld-quarzowhite text-osvauld-frameblack"
			>{part.text}</span
		>
	{:else}
		{part.text}
	{/if}
{/each}
