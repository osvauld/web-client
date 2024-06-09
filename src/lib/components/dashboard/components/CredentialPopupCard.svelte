<script lang="ts">
	import EncryptedField from "../credentials/EncryptedField.svelte";
	import PlainField from "../credentials/PlainField.svelte";

	import { Credential } from "../dtos";

	export let credential: Credential;

	let sensitiveFields = credential.fields.filter(
		(field) => field.fieldType === "totp" || field.fieldType === "sensitive",
	);

	let nonSensitiveFields = credential.fields.filter(
		(field) => field.fieldType !== "totp" && field.fieldType !== "sensitive",
	);

	console.log(credential, sensitiveFields, nonSensitiveFields);
</script>

<button
	class="mb-1 w-full overflow-x-hidden flex-none rounded-xl text-osvauld-chalkwhite">
	<button
		class="container mx-auto py-0 pl-3 pr-1 relative group bg-osvauld-cardshade rounded-xl">
		<div
			class="w-full h-[90%] overflow-y-scroll scrollbar-thin pr-0 active mt-2">
			{#each nonSensitiveFields as field}
				{#if field.fieldName !== "Domain"}
					<PlainField
						bgColor="{null}"
						fieldName="{field.fieldName}"
						fieldValue="{field.fieldValue}"
						hoverEffect="{true}" />
				{/if}
			{/each}
			{#if sensitiveFields}
				{#each sensitiveFields as field}
					<EncryptedField
						bgColor="{null}"
						fieldName="{field.fieldName}"
						fieldValue="{field.fieldValue}"
						fieldType="{field.fieldType}"
						hoverEffect="{true}" />
				{/each}
			{/if}
		</div>
		<div
			class="{credential.description && credential.description.length !== 0
				? 'visible'
				: 'invisible'}"
		>

			<label
				class="text-osvauld-dusklabel block text-left text-sm font-normal"
				for="credential-description">
				Description
			</label>
			<div
				class=" {credential.description && credential.description.length !== 0
					? 'h-[4rem]'
					: ''} mt-4 w-[96%] py-1 px-2 overflow-y-scroll bg-osvauld-fieldActive rounded-lg text-left scrollbar-thin resize-none text-base
     text-osvauld-fieldTextActive font-normal text-sm"
				id="credential-description">
				{credential.description}
			</div>
		</div>
	</button>
</button>
