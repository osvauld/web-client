<script lang="ts">
  import browser from "webextension-polyfill";
  import Eye from "../basic/icons/eye.svelte";
  import Loader from "../dashboard/components/Loader.svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  let passphrase = "";
  let showPassword = false;
  let errorMessage = false;
  let isLoaderActive = false;

  function toggleShowPassword() {
    showPassword = !showPassword;
  }

  $: type = showPassword ? "text" : "password";
  async function handleSubmit() {
    isLoaderActive = true;
    const response = await browser.runtime.sendMessage({
      action: "initiateAuth",
      data: { passphrase },
    });
    if (response.isAuthenticated) {
      dispatch("authenticated", true);
    } else {
      errorMessage = true;
    }
    isLoaderActive = false;
  }
  const onInput = (event: any) => {
    passphrase = event.target.value;
  };
</script>

<div
  class="h-auto mt-10 flex justify-center items-center text-base font-normal text-osvauld-sheffieldgrey"
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
      <span class="text-xs text-red-500 font-thin mt-2"
        >Passphrase doesn't match</span
      >
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
</div>
