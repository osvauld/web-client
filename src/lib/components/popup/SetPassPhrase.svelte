<script lang="ts">
  import Eye from "../basic/icons/eye.svelte";
  import browser from "webextension-polyfill";
  import { isSignedUp } from "../../store/ui.store";
  export let rsaKey: CryptoKeyPair;
  export let eccKey: CryptoKeyPair;

  let passphrase = "";
  let confirmPassphrase = "";
  let showPassword = false;
  let showPassphraseMismatchError = false;
  $: type = showPassword ? "text" : "password";
  const handlePassPhraseSubmit = async () => {
    if (passphrase === confirmPassphrase) {
      const response = await browser.runtime.sendMessage({
        action: "savePassphrase",
        passphrase: passphrase,
        rsaKey,
        eccKey,
      });
      if (response.isSaved) {
        isSignedUp.set(true);
      }
    } else showPassphraseMismatchError = true;
  };
  function onInput(event: any, type: string) {
    if (type === "passphrase") passphrase = event.target.value;
    else confirmPassphrase = event.target.value;
  }
</script>

<form
  class="flex flex-col justify-center items-center"
  on:submit|preventDefault={handlePassPhraseSubmit}
>
  <label for="passphrase">Enter Passphrase</label>

  <div
    class="flex bg-[#2E3654] px-3 mt-4 border rounded-3xl border-[#4C598B4D]"
  >
    <input
      class="text-white bg-[#2E3654] border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0"
      {type}
      id="password"
      on:input={(e) => onInput(e, "passphrase")}
    />

    <button
      type="button"
      class="flex justify-center items-center"
      on:click={() => !showPassword}
    >
      <Eye />
    </button>
  </div>
  <label for="passphrase">Confirm Passphrase</label>

  <div
    class="flex bg-[#2E3654] px-3 mt-4 border rounded-3xl border-[#4C598B4D]"
  >
    <input
      class="text-white bg-[#2E3654] border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0"
      {type}
      id="password"
      on:input={(e) => onInput(e, "confirmPassphrase")}
    />

    <button
      type="button"
      class="flex justify-center items-center"
      on:click={() => !showPassword}
    >
      <Eye />
    </button>
  </div>
  {#if showPassphraseMismatchError}
    <span class="text-xs text-red-500 font-thin">Passphrase doesn't match</span>
  {/if}
  <button class="bg-[#4E46DC] py-3 px-7 mt-5 rounded-3xl" type="submit"
    >Submit</button
  >
</form>
