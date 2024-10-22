<!-- ChildComponent.svelte -->
<script>
	import { onMount, onDestroy, afterUpdate } from "svelte";

	export let counter;

	let progress = 1;

	onMount(() => {
		// Initialize the circle when the component mounts
		updateCircle(progress);
	});

	afterUpdate(() => {
		// Update progress based on the new counter value
		progress = counter / 30; // Assuming 30 is the initial value
		updateCircle(progress);
	});

	function updateCircle(value) {
		const circle = document.querySelector("circle.progress");
		const radius = circle.r.baseVal.value;
		const circumference = radius * 2 * Math.PI;

		circle.style.strokeDasharray = `${circumference}`;
		const offset = value * circumference;
		circle.style.strokeDashoffset = `${circumference - offset}`;
	}
</script>

<style>
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		--size: 24px; /* Base size for the circle */
		--stroke-width: 2px; /* Width of the stroke */
	}

	.skill {
		width: var(--size);
		height: var(--size);
		position: relative;
		background-color: #16171f;
	}

	circle {
		fill: none;
		stroke-width: var(--stroke-width);
		stroke-dasharray: 0;
		stroke-dashoffset: 0;
		transform: rotate(-90deg);
		transform-origin: 50% 50%;
		transition: stroke-dashoffset 0.1s linear; /* Smooth transition */
	}

	.track {
		stroke: #6b6c76;
	}

	.progress {
		stroke: #bfc0cc;
	}

	.inner {
		height: calc(var(--size) - var(--stroke-width));
		width: calc(var(--size) - var(--stroke-width));
		background-color: #16171f;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	#number {
		font-family: 600;
		font-size: 14px;
		color: #6e7681;
		place-content: center;
		position: absolute;
		right: -20px;
		top: 2px;
	}

	svg {
		position: absolute;
		top: 0;
		left: 0;
	}
</style>

<div class="skill">
	<div class="inner">
		<div id="number">{counter}</div>
	</div>

	<svg
		xmlns="http://www.w3.org/2000/svg"
		version="1.1"
		width="24px"
		height="24px">
		<circle class="track" cx="50%" cy="50%" r="10" stroke-linecap="round"
		></circle>
		<circle class="progress" cx="50%" cy="50%" r="10" stroke-linecap="round"
		></circle>
	</svg>
</div>
