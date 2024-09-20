<script lang="ts">
	import { fade } from "svelte/transition";

	export let password: string = "";

	let strengthScore = 0;
	let strengthLevel = "";
	let conditions = [
		{ key: "lowercase", label: "Lowercase letter", regex: /[a-z]/, met: false },
		{ key: "uppercase", label: "Uppercase letter", regex: /[A-Z]/, met: false },
		{ key: "number", label: "Number", regex: /[0-9]/, met: false },
		{
			key: "specialChar",
			label: "Special character",
			regex: /[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/,
			met: false,
		},
		{ key: "length", label: "At least 8 characters", met: false },
	];

	$: {
		checkStrength(password);
	}

	function checkStrength(password: string) {
		conditions.forEach((condition) => {
			if (condition.key === "length") {
				condition.met = password.length >= 8;
			} else {
				condition.met = condition.regex.test(password);
			}
		});

		strengthScore = conditions.filter((condition) => condition.met).length;

		if (strengthScore <= 2) {
			strengthLevel = "Weak";
		} else if (strengthScore <= 4) {
			strengthLevel = "Medium";
		} else {
			strengthLevel = "Strong";
		}
	}

	function getStrengthColor(score: number): string {
		if (score <= 2) return "bg-red-500";
		if (score <= 4) return "bg-yellow-500";
		return "bg-green-500";
	}

	function getStrengthWidth(score: number): string {
		return `${(score / conditions.length) * 100}%`;
	}
</script>

<div
	class="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6"
>
	<div class="mb-4">
		<div class="h-2 w-full bg-gray-300 rounded-full">
			<div
				class="h-full rounded-full transition-all duration-300 ease-out {getStrengthColor(
					strengthScore,
				)}"
				style="width: {getStrengthWidth(strengthScore)}"
			></div>
		</div>
		<p class="text-sm mt-1 text-gray-600">Password Strength: {strengthLevel}</p>
	</div>

	<ul class="list-none p-0">
		{#each conditions.filter((condition) => !condition.met) as condition (condition.key)}
			<li transition:fade="{{ duration: 200 }}" class="flex items-center mb-2">
				<svg
					class="w-4 h-4 mr-2 text-gray-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					></path>
				</svg>
				<span class="text-sm text-gray-700">{condition.label}</span>
			</li>
		{/each}
	</ul>
</div>
