<script lang="ts">
    import {
        selectedEnv,
        showAddCliDrawer,
        envStore,
        showAddEnvDrawer,
    } from "../store";
    import AddCredentialToEnv from "./AddCredentialToEnv.svelte";
    import AddCliUser from "./AddCliUser.svelte";
    import AddEnvironment from "./AddEnvironment.svelte";
    import { Add } from "../icons";
    import { fetchEnvFields } from "../apis";

    let addCredentialHovered = false;
    let addcredentialToEnv = false;
    let fields = [];
    const addEnv = () => {
        showAddEnvDrawer.set(true);
    };

    const addCliUser = () => {
        showAddCliDrawer.set(true);
    };
    selectedEnv.subscribe(async (value) => {
        if (value) {
            const fieldsResponse = await fetchEnvFields(value.id);
            fields = fieldsResponse.data;
        }
    });
</script>

<div class="flex justify-between">
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
            on:mouseenter={() => (addCredentialHovered = true)}
            on:mouseleave={() => (addCredentialHovered = false)}
            on:click={() => (addcredentialToEnv = true)}
        >
            <span class="mr-2">Add Credential</span>
            <Add color={addCredentialHovered ? "#0D0E13" : "#A3A4B5"} />
        </button>
    {:else}
        <button on:click={addCliUser}>create cli user</button>

        <button on:click={addEnv}> add environment </button>
    {/if}
</div>

{#if $selectedEnv}
    <ul>
        {#each fields as field}
            <li>
                {field.fieldName}
                {field.fieldValue}
            </li>
        {/each}
    </ul>
{:else}
    <ul>
        {#each $envStore as env}
            <li>
                {env.name}
            </li>
        {/each}
    </ul>
{/if}
{#if addcredentialToEnv}
    <button
        class="fixed inset-0 flex items-center justify-center z-50 bg-osvauld-backgroundBlur backdrop-filter backdrop-blur-[2px]"
        on:click={() => !addcredentialToEnv}
    >
        <button class="p-6 rounded bg-transparent" on:click|stopPropagation>
            <AddCredentialToEnv on:close={() => (addcredentialToEnv = false)} />
        </button>
    </button>
{/if}
{#if $showAddCliDrawer}
    <AddCliUser />
{/if}
{#if $showAddEnvDrawer}
    <AddEnvironment />
{/if}
