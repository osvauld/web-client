<script lang="ts">
  import TempLogin from "./TempLogin.svelte";
  import SetPassPhrase from "./SetPassPhrase.svelte";
  import SetBaseUrl from "./components/SetBaseUrl.svelte";
  import ImportPvtKey from "./ImportPvtKey.svelte";
  import browser from "webextension-polyfill";

  import { isLoggedIn, isSignedUp } from "../../store/ui.store";

  let isTempLoginVerified = false;
  let isBaseUrlSet = false;
  let challenge = "";
  let username = "";
  let importPvtKeyFlag = false;
  const handleTempLogin = (e: any) => {
    challenge = e.detail.challenge;
    username = e.detail.username;
    isTempLoginVerified = true;
  };
  const handleBaseUrlSubmit = () => {
    isBaseUrlSet = true;
  };

  const handleImportPvtKey = () => {
    console.log("handleImportPvtKey");
    isBaseUrlSet = true;
    importPvtKeyFlag = true;
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
  {#if !isBaseUrlSet}
    <SetBaseUrl
      on:baseUrlAdded={handleBaseUrlSubmit}
      on:importPvtKey={handleImportPvtKey}
    />
  {:else if importPvtKeyFlag}
    <ImportPvtKey on:submit={(e) => importPvtKey(e)} />
  {:else if isTempLoginVerified}
    <SetPassPhrase {challenge} {username} />
  {:else}
    <TempLogin on:setPassPhrase={handleTempLogin} />
  {/if}
</div>
