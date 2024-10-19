<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import EncryptedField from "./EncryptedField.svelte";
	import PlainField from "./PlainField.svelte";
	import { More } from "../icons";
	import {
		showCredentialDetailsDrawer,
		searchedCredential,
		showMoreOptions,
		buttonRef,
		modalManager,
	} from "../store";
	import { Credential, Field } from "../dtos";
	import { tweened } from "svelte/motion";
	const dispatch = createEventDispatcher();
	export let credential: Credential;
	export let checked = false;
	let sensitiveFields: Field[] = [];
	let decrypted = false;
	let hoverEffect = false;
	let hoverTimeout: any;
	let borderHighLight = tweened(0, { duration: 700 });
	$: {
		if ($searchedCredential?.credentialId === credential.credentialId) {
			borderHighLight.set(1);
			setTimeout(() => {
				borderHighLight.set(0);
				searchedCredential.set(null);
			}, 500);
		}
	}
	function toggleCheck() {
		checked = !checked;
		dispatch("check", checked);
	}
	function handleMouseEnter() {
		hoverEffect = true;
	}
	function handleMouseLeave() {
		if (!$showCredentialDetailsDrawer) {
			sensitiveFields = [];
		}
		clearTimeout(hoverTimeout);
		decrypted = false;
		hoverEffect = false;
	}

	const triggerMoreActions = (e: any) => {
		buttonRef.set(e.currentTarget);
		modalManager.set({
			id: credential.credentialId,
			name: credential.name,
			type: "Credential",
		});
		dispatch("action", true);
		showMoreOptions.set(true);
	};

	const handleClick = async () => {
		dispatch("select", sensitiveFields);
		sensitiveFields = [];
	}; /* eslint-disable */
</script>

<button
	class="mb-1 overflow-x-hidden flex-none rounded-xl text-osvauld-chalkwhite border border-osvauld-iconblack {checked &&
		'shadow-[0_0_0_1px_#B4BEFE]'}"
	style="border: {$borderHighLight ? '1px solid #89B4FA' : ''}"
	on:mouseenter="{handleMouseEnter}"
	on:mouseleave="{handleMouseLeave}"
	on:click="{handleClick}">
	<button
		class="container mx-auto py-3 pl-3 pr-1 relative group bg-osvauld-cardshade rounded-xl">
		<!-- svelte-ignore a11y-<code> -->
		<button
			class="flex justify-center items-center border-osvauld-iconblack pb-2"
			on:click|stopPropagation>
			<label
				class="text-lg font-light text-left ml-2 cursor-pointer w-[10rem] overflow-x-hidden whitespace-nowrap {hoverEffect
					? 'text-osvauld-sideListTextActive'
					: 'text-osvauld-fieldTextActive '} "
				for="{credential.credentialId}">
				{credential.name}
			</label>
			{#if credential.accessType === "manager"}
				<button class="pr-2" on:click="{triggerMoreActions}">
					<More />
				</button>
			{/if}
		</button>
		<div
			class="border-b border-osvauld-iconblack w-[calc(100%+1.5rem)] -translate-x-3">
		</div>
		<div
			class="w-[15rem] {credential.description.length !== 0
				? 'h-[11.5rem]'
				: 'h-[15rem]'} overflow-y-scroll scrollbar-thin pr-0 {hoverEffect
				? 'active'
				: ''} mt-2">
			{#if credential.credentialType !== "Note"}
				{#each credential.credentialFields as field}
					{#if field.fieldName !== "Domain" && field.fieldName && field.fieldValue}
						<PlainField
							fieldName="{field.fieldName}"
							fieldValue="{field.fieldValue}"
							{hoverEffect} />
					{/if}
				{/each}
				{#if sensitiveFields}
					{#each sensitiveFields as field}
						{#if field.fieldName && field.fieldValue}
							<EncryptedField
								fieldName="{field.fieldName}"
								fieldValue="{field.fieldValue}"
								fieldType="{field.fieldType}"
								{hoverEffect} />
						{/if}
					{/each}
				{/if}
			{:else}
				<div>
					<label
						class="text-osvauld-dusklabel block text-left text-xs font-normal"
						for="Note">
						Note
					</label>
					<div
						class="mt-1 w-[14.3rem] h-[10rem] py-1 px-2 overflow-y-scroll rounded-lg text-left scrollbar-thin resize-none text-sm
    {hoverEffect
							? 'text-osvauld-fieldTextActive bg-osvauld-fieldActive'
							: 'text-osvauld-fieldText'}"
						id="credential-description">
						{credential.credentialFields[0].fieldValue}
					</div>
				</div>
			{/if}
		</div>
		<div
			class="{credential.description.length !== 0 ? 'visible' : 'invisible'}">
			<label
				class="text-osvauld-dusklabel block text-left text-xs font-normal"
				for="credential-description">
				Description
			</label>
			<div
				class="mt-1 w-[14.3rem] {credential.description.length !== 0
					? 'h-[4rem]'
					: ''} py-1 px-2 overflow-y-scroll rounded-lg text-left scrollbar-thin resize-none text-sm
    {hoverEffect
					? 'text-osvauld-fieldTextActive bg-osvauld-fieldActive'
					: 'text-osvauld-fieldText'}"
				id="credential-description">
				{credential.description}
			</div>
		</div>
	</button>
</button>
