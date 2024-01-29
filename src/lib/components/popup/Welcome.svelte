<script lang="ts">
  import browser from "webextension-polyfill";
  import { isLoggedIn } from "../../store/ui.store";
  import Eye from "../basic/eye.svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  let passphrase = "";
  let showPassword = false;
  let errorMessage = false;

  function toggleShowPassword() {
    showPassword = !showPassword;
  }

  $: type = showPassword ? "text" : "password";
  async function handleSubmit() {
    const response = await browser.runtime.sendMessage({
      action: "initiateAuth",
      data: { passphrase },
    });
    if (response.isAuthenticated) {
      console.log("dispatching event....");
      dispatch("authenticated", true);
    }
  }
  const onInput = (event) => {
    passphrase = event.target.value;
  };
</script>

<div
  class="h-auto mt-12 flex justify-center items-center text-base font-bold text-white"
>
  <form
    class="flex flex-col justify-center items-center"
    on:submit|preventDefault={handleSubmit}
  >
    <label for="passphrase">Enter Passphrase</label>

    <div
      class="flex bg-osvauld-frameblack px-3 mt-4 border rounded-lg border-osvauld-iconblack"
    >
      <input
        class="text-white bg-osvauld-frameblack border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0"
        {type}
        id="passphrase"
        on:input={onInput}
      />
      <button
        type="button"
        class="flex justify-center items-center"
        on:click={toggleShowPassword}
      >
        <Eye />
      </button>
    </div>
    {#if errorMessage}
      <span class="text-xs text-red-500 font-thin"
        >Passphrase doesn't match</span
      >
    {/if}
    <button class="bg-osvauld-carolinablue py-2 px-10 mt-8 rounded-lg text-osvauld-ninjablack font-medium" type="submit"
      >Submit</button
    >
  </form>
</div>
