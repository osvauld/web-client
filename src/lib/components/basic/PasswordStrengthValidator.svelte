<script lang="ts">
	export let passphrase: string = "";
	export let isPassphraseAcceptable = false;

	let strengthScore = 0;
	let specialCharPresent = false;
	let numberPresent = false;
	let upperCasePresent = false;
	let lowerCasePresent = false;
	let eightCharsPresent = false;

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
		checkStrength(passphrase);
		eightCharsPresent = conditions.find((item) => item["key"] === "length").met;

		specialCharPresent = conditions.find(
			(item) => item["key"] === "specialChar",
		).met;

		numberPresent = conditions.find((item) => item["key"] === "number").met;

		upperCasePresent = conditions.find(
			(item) => item["key"] === "uppercase",
		).met;

		lowerCasePresent = conditions.find(
			(item) => item["key"] === "lowercase",
		).met;
	}

	function checkStrength(passphrase: string) {
		conditions.forEach((condition) => {
			if (condition.key === "length") {
				condition.met = passphrase.length >= 8;
			} else {
				condition.met = condition.regex.test(passphrase);
			}
		});

		strengthScore = conditions.filter((condition) => condition.met).length;

		if (strengthScore <= 2) {
			isPassphraseAcceptable = false;
		} else if (strengthScore <= 4) {
			isPassphraseAcceptable = false;
		} else {
			isPassphraseAcceptable = true;
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

<div class="w-[300px] rounded-xl shadow-md overflow-hidden p-2">
	<div class="mb-4">
		<div class="h-2 w-full bg-gray-300 rounded-full">
			<div
				class="h-full rounded-full transition-all duration-300 ease-out {getStrengthColor(
					strengthScore,
				)}"
				style="width: {getStrengthWidth(strengthScore)}"
			></div>
		</div>
		<p
			class="text-xs mt-1 font-light text-osvauld-sheffieldgrey text-center tracking-wide"
		>
			Passphrase should include at least <span
				class=" {eightCharsPresent ? 'text-green-500' : 'text-yellow-300'}"
				>8 characters</span
			>
			with one or more
			<span class="{specialCharPresent ? 'text-green-500' : 'text-yellow-300'}"
				>Special character</span
			>,
			<span class="{numberPresent ? 'text-green-500' : 'text-yellow-300'}"
				>Number</span
			>,
			<span class="{upperCasePresent ? 'text-green-500' : 'text-yellow-300'}"
				>Uppercase</span
			>
			and
			<span class="{lowerCasePresent ? 'text-green-500' : 'text-yellow-300'}"
				>Lowercase</span
			> letters.
		</p>
	</div>
</div>
