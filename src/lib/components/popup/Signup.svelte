<script lang="ts">
  import TempLogin from "./TempLogin.svelte";
  import SetPassPhrase from "./SetPassPhrase.svelte";
  let isTempLoginVerified = false;
  let challenge = "";
  let username = "";
  const handleTempLogin = (e: any) => {
    challenge = e.detail.challenge;
    username = e.detail.username;
    isTempLoginVerified = true;
  };
</script>

<div
  class="h-auto mt-12 flex justify-center items-center text-base font-bold text-white"
>
  {#if isTempLoginVerified}
    <SetPassPhrase {challenge} {username} />
  {:else}
    <TempLogin on:setPassPhrase={handleTempLogin} />
  {/if}
</div>
