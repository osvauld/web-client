<script lang="ts">
	import {
		selectedEnv,
		showAddCliDrawer,
		envStore,
		showAddEnvDrawer,
	} from "../store";
	import AddCredentialToEnv from "./AddCredentialToEnv.svelte";
	import AddCliUser from "./AddCliUser.svelte";
	import { Add } from "../icons";
	import { fetchEnvFields } from "../apis";
	import EnvironmentAdd from "../../basic/icons/environmentAdd.svelte";
	import UserPlus from "../../basic/icons/userPlus.svelte";
	import AddEnvironment from "./AddEnvironment.svelte";
	import EnvironmentCredential from "./EnvironmentCredential.svelte";
	import { onMount } from "svelte";

	let addCredentialHovered = false;
	let addcredentialToEnv = false;
	let addNewUserHovered = false;
	let addNewCliUserHovered = false;
	let credentials = [];

	const addEnv = () => {
		showAddEnvDrawer.set(true);
	};

	const addCliUser = () => {
		showAddCliDrawer.set(true);
	};

	selectedEnv.subscribe(async (value) => {
		if (value) {
			const fieldsResponse = await fetchEnvFields(value.id);
			credentials = fieldsResponse.data;
		}
	});
</script>

<div class="flex justify-between items-center my-4 p-2">
	<h1
		class="text-3xl p-4 font-normal whitespace-nowrap text-osvauld-sideListTextActive"
	>
		{#if $selectedEnv}
			{$selectedEnv.name}
		{:else}
			Environments
		{/if}
	</h1>
	{#if $selectedEnv}
		<button
			class="rounded-md py-1.5 px-4 mx-2 flex justify-center items-center whitespace-nowrap text-sm border text-osvauld-textActive border-osvauld-iconblack hover:text-osvauld-frameblack hover:bg-osvauld-carolinablue"
			on:mouseenter="{() => (addCredentialHovered = true)}"
			on:mouseleave="{() => (addCredentialHovered = false)}"
			on:click="{() => (addcredentialToEnv = true)}"
		>
			<span class="mr-2">Add Credential to environment</span>
			<Add color="{addCredentialHovered ? '#0D0E13' : '#A3A4B5'}" />
		</button>
	{:else}
		<div class="flex items-center gap-4">
			<button
				class="rounded-md h-[40px] py-1.5 px-4 mx-2 flex justify-center items-center whitespace-nowrap text-sm border text-osvauld-textActive border-osvauld-iconblack hover:text-osvauld-frameblack hover:bg-osvauld-carolinablue"
				on:mouseenter="{() => (addNewCliUserHovered = true)}"
				on:mouseleave="{() => (addNewCliUserHovered = false)}"
				on:click="{addCliUser}"
			>
				<span class="mr-2">Add new CLI user</span>
				<UserPlus color="{addNewCliUserHovered ? '#0D0E13' : '#A3A4B5'}" />
			</button>

			<button
				class="rounded-md h-[40px] py-1.5 px-4 mx-2 flex justify-center items-center whitespace-nowrap text-sm border text-osvauld-textActive border-osvauld-iconblack hover:text-osvauld-frameblack hover:bg-osvauld-carolinablue"
				on:mouseenter="{() => (addNewUserHovered = true)}"
				on:mouseleave="{() => (addNewUserHovered = false)}"
				on:click="{addEnv}"
			>
				<span class="mr-2">Add new environment </span>
				<EnvironmentAdd color="{addNewUserHovered ? '#0D0E13' : '#A3A4B5'}" />
			</button>
		</div>
	{/if}
</div>

{#if $selectedEnv}
	{#each credentials as credential}
		<ul
			class="border border-osvauld-iconblack rounded-xl bg-osvauld-cardshade text-osvauld-fieldText mx-4 px-4 py-2 overflow-x-hidden my-6"
		>
			<div
				class="text-osvauld-fieldTextActive text-lg font-medium py-2 border-b border-osvauld-iconblack"
			>
				{credential.credentialName}
			</div>
			<div
				class="flex flex-col p-4 pl-0 pt-0 overflow-y-scroll scrollbar-thin h-[10rem] mt-2"
			>
				<EnvironmentCredential {credential} />
			</div>
		</ul>
	{/each}
{:else}
	<div class="w-full">
		<ul class="w-[90%] mx-auto text-osvauld-fieldText font-light">
			<div class="flex justify-between items-center p-4">
				<span class="w-[15rem] text-center">Environment Name</span><span
					class="w-[15rem] text-center">CLI user</span
				><span class="w-[15rem] text-center pr-6">Created At</span>
			</div>
			<div class="border-b border-osvauld-iconblack my-1 w-full mt-auto"></div>
			{#each $envStore as env}
				<li
					class="my-2 py-3 px-6 bg-osvauld-cardshade rounded-lg flex justify-between items-center text-base"
				>
					<span class="w-[15rem] text-center">{env.name}</span>
					<span class="w-[15rem] text-center">{env.cliUsername}</span>
					<span class="w-[15rem] text-center"
						>{new Date(env.createdat).toLocaleString().split(",")[0]}</span
					>
				</li>
			{/each}
		</ul>
	</div>
{/if}

{#if addcredentialToEnv}
	<button
		class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
		on:click="{() => !addcredentialToEnv}"
	>
		<button class="p-6 rounded bg-transparent" on:click|stopPropagation>
			<AddCredentialToEnv on:close="{() => (addcredentialToEnv = false)}" />
		</button>
	</button>
{/if}
{#if $showAddCliDrawer}
	<button
		class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
		on:click="{() => showAddCliDrawer.set(false)}"
	>
		<button class="p-6 rounded bg-transparent" on:click|stopPropagation>
			<AddCliUser />
		</button>
	</button>
{/if}
{#if $showAddEnvDrawer}
	<button
		class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
		on:click="{() => showAddEnvDrawer.set(false)}"
	>
		<button class="p-6 rounded bg-transparent" on:click|stopPropagation>
			<AddEnvironment />
		</button>
	</button>
{/if}
