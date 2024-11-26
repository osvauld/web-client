<script lang="ts">
	import Initiator from "../views/Initiator.svelte";
	import Acceptor from "../views/Acceptor.svelte";
	let initiator = false;
	const changeProfile = () => {
		initiator = !initiator;
	};
</script>

<button class="text-white" on:click="{changeProfile}">
	{#if initiator}
		<span>Initiator</span>
	{:else}
		<span>Acceptor</span>
	{/if}
</button>
{#if initiator}
	<Initiator />
{:else}
	<Acceptor />
{/if}
