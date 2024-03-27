<script lang="ts">
  import TempLogin from "./TempLogin.svelte";
  import SetPassPhrase from "./SetPassPhrase.svelte";
  import ImportPvtKey from "./ImportPvtKey.svelte";
  import browser from "webextension-polyfill";
  import { isLoggedIn, isSignedUp } from "../../store/ui.store";

  let isTempLoginVerified = false;
  let challenge = "";
  let username = "";
  let importPvtKeyFlag = false;

  const handleTempLogin = (e: any) => {
    challenge = e.detail.challenge;
    username = e.detail.username;
    isTempLoginVerified = true;
  };

  const handleRecovery = (e: any) => {
    importPvtKeyFlag = e.detail;
  };

  const importPvtKey = async (e: any) => {
    console.log(e.detail);
    const { privateKeys, passphrase } = e.detail;
    await browser.runtime.sendMessage({
      action: "importPvtKey",
      passphrase,
      privateKeys,
    });
    isLoggedIn.set(true);
    isSignedUp.set(true);
  };
</script>

<div
  class="h-full flex justify-center items-center text-base font-bold text-white"
>
  {#if importPvtKeyFlag}
    <ImportPvtKey on:submit={(e) => importPvtKey(e)} />
  {:else if isTempLoginVerified}
    <SetPassPhrase {challenge} {username} />
  {:else}
    <TempLogin
      on:setPassPhrase={handleTempLogin}
      on:recovery={handleRecovery}
    />
  {/if}
</div>
