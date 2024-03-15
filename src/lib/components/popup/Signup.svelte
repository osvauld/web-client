<script lang="ts">
  import TempLogin from "./TempLogin.svelte";
  import SetPassPhrase from "./SetPassPhrase.svelte";
  import SetBaseUrl from "./components/SetBaseUrl.svelte";
  let isTempLoginVerified = false;
  let isBaseUrlSet = false;
  let challenge = "";
  let username = "";
  const handleTempLogin = (e: any) => {
    challenge = e.detail.challenge;
    username = e.detail.username;
    isTempLoginVerified = true;
  };
  const handleBaseUrlSubmit = () => {
    isBaseUrlSet = true;
  };
</script>

<div
  class="h-full flex justify-center items-center text-base font-bold text-white"
>
  {#if !isBaseUrlSet}
    <SetBaseUrl on:baseUrlAdded={handleBaseUrlSubmit} />
  {:else if isTempLoginVerified}
    <SetPassPhrase {challenge} {username} />
  {:else}
    <TempLogin on:setPassPhrase={handleTempLogin} />
  {/if}
</div>
