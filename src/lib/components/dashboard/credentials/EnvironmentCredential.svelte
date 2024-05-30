<script lang="ts">
	import { scale } from "svelte/transition";
	import { onMount } from "svelte";
	import { sendMessage } from "../helper";
	import { Eye, ClosedEye, CopyIcon, Tick } from "../icons";
	import { createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher();
	export let credential;
	let decryptedValues = [];
	let fieldCopied = {};
	let visibility = [];
	let fieldNameEdited = false;
	export let activefieldId = null;
	let initialCredential = structuredClone(credential);

	const copyToClipboard = async (value, fieldName) => {
		fieldCopied[fieldName] = true;
		try {
			await navigator.clipboard.writeText(value);
		} catch (err) {
			console.error("Failed to copy: ", err);
		}
		setTimeout(() => {
			fieldCopied[fieldName] = false;
		}, 2000);
	};

	const decrypt = async (index, fieldValue) => {
		const response = await sendMessage("decryptField", fieldValue);
		decryptedValues[index] = response.data;
	};

	const toggleVisibility = (index) => {
		visibility[index] = !visibility[index];
		setTimeout(() => {
			visibility[index] = false;
		}, 3000);
	};

	const checkAnyFieldChanged = (index) => {
		fieldNameEdited =
			credential.fields[index].fieldName !==
			initialCredential.fields[index].fieldName;
		if (fieldNameEdited) {
			dispatch("edit", credential.fields[index]);
		}
	};

	const initializeDecryption = () => {
		credential.fields.forEach((field, index) => {
			decrypt(index, field.fieldValue);
		});
	};

	onMount(() => {
		initializeDecryption();
	});
</script>

{#each credential.fields as field, index}
	<div class="flex justify-between items-center my-1">
		<div
			class="w-[30%] bg-osvauld-fieldActive rounded-lg pl-0 pr-2 py-0.5 flex justify-between items-center"
		>
			<input
				class="py-1 px-2 inline-block w-[90%] overflow-x-hidden text-ellipsis rounded-lg items-center text-base bg-osvauld-fieldActive border-0 h-10 mx-2 focus:ring-0"
				id="{field.fieldId}"
				type="text"
				disabled="{activefieldId && activefieldId !== field.fieldId}"
				bind:value="{field.fieldName}"
				on:input="{() => checkAnyFieldChanged(index)}"
			/>
			<button
				on:click|preventDefault|stopPropagation="{() =>
					copyToClipboard(field.fieldName, `fieldName-${index}`)}"
			>
				{#if fieldCopied[`fieldName-${index}`]}
					<span in:scale>
						<Tick />
					</span>
				{:else}
					<CopyIcon color="#4D4F60" />
				{/if}
			</button>
		</div>
		<div
			class="w-[68%] bg-osvauld-fieldActive rounded-lg pl-0 pr-2 py-0.5 flex justify-between items-center"
		>
			<input
				class="py-1 px-2 inline-block w-[90%] overflow-x-hidden text-ellipsis rounded-lg items-center text-base bg-osvauld-fieldActive border-0 h-10 mx-2 focus:ring-0"
				id="{field.fieldId}"
				type="text"
				autocomplete="off"
				value="{visibility[index] ? decryptedValues[index] : '*'.repeat(8)}"
			/>
			<div class="w-2/5 flex gap-2 items-center justify-end">
				<button on:click|stopPropagation="{() => toggleVisibility(index)}">
					{#if visibility[index]}
						<ClosedEye color="#4D4F60" />
					{:else}
						<Eye color="#4D4F60" />
					{/if}
				</button>
				<button
					on:click|stopPropagation="{() =>
						copyToClipboard(decryptedValues[index], `fieldValue-${index}`)}"
				>
					{#if fieldCopied[`fieldValue-${index}`]}
						<span in:scale>
							<Tick />
						</span>
					{:else}
						<CopyIcon color="{'#4D4F60'}" />
					{/if}
				</button>
			</div>
		</div>
	</div>
{/each}
