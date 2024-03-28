<script lang="ts">
  import Eye from "../basic/icons/eye.svelte";

  import { isSignedUp } from "../../store/ui.store";
  import Loader from "../dashboard/components/Loader.svelte";

  export let challenge;
  export let username;

  let passphrase = "";
  let confirmPassphrase = "";
  let showPassword = false;
  let showPassphraseMismatchError = false;
  let isLoaderActive = false;

  $: type = showPassword ? "text" : "password";
  const handlePassPhraseSubmit = async () => {
    isLoaderActive = true;
    if (passphrase === confirmPassphrase) {
      const response = await chrome.runtime.sendMessage({
        action: "savePassphrase",
        passphrase,
        challenge,
        username,
      });
      if (response.isSaved) {
        isSignedUp.set(true);
        isLoaderActive = false;
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
  <label for="passphrase" class="font-normal mt-6">Enter Passphrase</label>

  <div
    class="flex bg-osvauld-frameblack px-3 mt-4 border rounded-lg border-osvauld-iconblack"
  >
    <input
      class="text-white bg-osvauld-frameblack border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0"
      {type}
      autocomplete="off"
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
  <label for="passphrase" class="font-normal mt-6">Confirm Passphrase</label>

  <div
    class="flex bg-osvauld-frameblack px-3 mt-4 border rounded-lg border-osvauld-iconblack"
  >
    <input
      class="text-white bg-osvauld-frameblack border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0"
      {type}
      autocomplete="off"
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
  <button
    class="bg-osvauld-carolinablue py-2 px-10 mt-8 rounded-lg text-osvauld-ninjablack font-medium w-[150px] flex justify-center items-center whitespace-nowrap"
    type="submit"
  >
    {#if isLoaderActive}
      <Loader size={24} color="#1F242A" duration={1} />
    {:else}
      <span>Submit</span>
    {/if}</button
  >
</form>
