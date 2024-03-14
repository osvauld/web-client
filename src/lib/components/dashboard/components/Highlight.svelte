<script>
    export let text = "";
    export let query = "";

    $: parts = highlightMatch(text, query);

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
        <span class="bg-yellow-200">{part.text}</span>
    {:else}
        {part.text}
    {/if}
{/each}
