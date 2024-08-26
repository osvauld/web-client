<script lang="ts">
	export let value = "Grid";
	let checked = true;

	function handleClick(event) {
		const target = event.target;
		const state = target.getAttribute("aria-checked");
		checked = state === "true" ? false : true;
		value = checked === true ? "Grid" : "List";
	}

	const uniqueID = Math.floor(Math.random() * 100);
</script>

<style>
	/* Inner Design Option */
	.s--inner button {
		padding: 2px;
		background-color: #0d0e13;
		border: 0.5px solid #8b949e;
		color: #c9d1d9;
	}
	[role="switch"][aria-checked="true"] :first-child,
	[role="switch"][aria-checked="false"] :last-child {
		display: none;
		color: #fff;
	}

	.s--inner button span {
		user-select: none;
		pointer-events: none;
		padding: 0.25em;
	}

	.s--inner button:focus {
		outline: #161b22 solid 1px;
	}

	/* Inner Design Option */
	[role="switch"][aria-checked="true"] :first-child,
	[role="switch"][aria-checked="false"] :last-child {
		background: #161b22;
		display: inline-block;
	}
</style>

<div class="s s--inner">
	<button
		role="switch"
		aria-checked="{checked}"
		aria-labelledby="{`switch-${uniqueID}`}"
		on:click="{handleClick}"
	>
		<span>Grid</span>
		<span>List</span>
	</button>
</div>
