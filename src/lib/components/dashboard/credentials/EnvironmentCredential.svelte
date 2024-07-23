<script lang="ts">
	import { scale } from "svelte/transition";
	import { onMount } from "svelte";
	import { sendMessage } from "../helper";
	import { Eye, ClosedEye, CopyIcon, Tick } from "../icons";
	import { createEventDispatcher } from "svelte";
	import { Field } from "../dtos";
	const dispatch = createEventDispatcher();
	export let credential;
	export let activefieldId = null;
	let decryptedValues: {
		[key: string]: string;
	} = {};
	let fieldCopied: {
		[key: string]: boolean;
	} = {};
	let visibility: {
		[key: string]: boolean;
	} = {};
	let fieldNameEdited = false;
	let initialCredential = structuredClone(credential);

	const copyToClipboard = async (value: string, fieldName: string) => {
		fieldCopied[fieldName] = true;
		await navigator.clipboard.writeText(value);
		setTimeout(() => {
			fieldCopied[fieldName] = false;
		}, 2000);
	};

	const decrypt = async (fieldId: string, fieldValue: string) => {
		const response = await sendMessage("decryptField", fieldValue);
		decryptedValues[fieldId] = response.data;
	};

	const toggleVisibility = (fieldId: string) => {
		visibility[fieldId] = !visibility[fieldId];
		setTimeout(() => {
			visibility[fieldId] = false;
		}, 3000);
	};

	const checkValueChanged = (fieldId: string) => {
		const currentFieldData = credential.fields.find(
			(field) => field.fieldId === fieldId,
		);
		const baseFieldData = initialCredential.fields.find(
			(field) => field.fieldId === fieldId,
		);

		fieldNameEdited = currentFieldData?.fieldName !== baseFieldData?.fieldName;
		if (fieldNameEdited) {
			dispatch("edit", currentFieldData);
		}
	};

	const initializeDecryption = () => {
		credential.fields.forEach((field: Field) => {
			decrypt(field.fieldId, field.fieldValue);
		});
	};

	onMount(() => {
		initializeDecryption();
	});
	// TODO: Change the fields to another component
</script>

{#each credential.fields as field}
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
				on:input="{() => checkValueChanged(field.fieldId)}"
			/>
			<button
				on:click|preventDefault|stopPropagation="{() =>
					copyToClipboard(field.fieldName, `fieldName-${field.fieldId}`)}"
			>
				{#if fieldCopied[`fieldName-${field.fieldId}`]}
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
				value="{visibility[field.fieldId]
					? decryptedValues[field.fieldId]
					: '*'.repeat(50)}"
			/>
			<div class="w-2/5 flex gap-2 items-center justify-end">
				<button
					on:click|stopPropagation="{() => toggleVisibility(field.fieldId)}"
				>
					{#if visibility[field.fieldId]}
						<ClosedEye color="#4D4F60" />
					{:else}
						<Eye color="#4D4F60" />
					{/if}
				</button>
				<button
					on:click|stopPropagation="{() =>
						copyToClipboard(
							decryptedValues[field.fieldId],
							`fieldValue-${field.fieldId}`,
						)}"
				>
					{#if fieldCopied[`fieldValue-${field.fieldId}`]}
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
