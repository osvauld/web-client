<script lang="ts">
  import TempLogin from "./TempLogin.svelte";
  import SetPassPhrase from "./SetPassPhrase.svelte";
  let isTempLoginVerified = false;
  const handleTempLogin = () => {
    isTempLoginVerified = true;
  };
</script>

<div
  class="h-auto mt-12 flex justify-center items-center text-base font-bold text-white"
>
  {#if isTempLoginVerified}
    <SetPassPhrase />
  {:else}
    <TempLogin on:setPassPhrase={handleTempLogin} />
  {/if}
</div>
