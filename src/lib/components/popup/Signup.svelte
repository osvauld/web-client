<script lang="ts">
    import TempLogin from "./TempLogin.svelte";
    import SetPassPhrase from "./SetPassPhrase.svelte";
    let rsaKey = {};
    let eccKey = {};
    let isPasswordVerfied = false;
    const handleTempLogin = (event) => {
        rsaKey = event.detail.rsaKey;
        eccKey = event.detail.eccKey;
        isPasswordVerfied = true;
    };
</script>

<div
    class="h-auto mt-12 flex justify-center items-center text-base font-bold text-white"
>
    {#if isPasswordVerfied}
        <SetPassPhrase {rsaKey} {eccKey} />
    {:else}
        <TempLogin on:login={handleTempLogin} />
    {/if}
</div>
