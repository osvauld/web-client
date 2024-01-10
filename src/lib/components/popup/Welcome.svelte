<script lang="ts">
  import browser from "webextension-polyfill";
  import { isLoggedIn } from "../../store/ui.store";
  import Eye from "../basic/eye.svelte";

  let passphrase = "";
  let showPassword = false;
  let errorMessage = false;

  function toggleShowPassword() {
    showPassword = !showPassword;
  }

  $: type = showPassword ? "text" : "password";
  async function handleSubmit() {
    const response = await browser.runtime.sendMessage({
      action: "initiate_auth",
      data: { passphrase },
    });
    isLoggedIn.set(response.isAuthenticated);
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
      class="flex bg-[#2E3654] px-3 mt-4 border rounded-3xl border-[#4C598B4D]"
    >
      <input
        class="text-white bg-[#2E3654] border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0"
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
    <button class="bg-[#4E46DC] py-3 px-7 mt-5 rounded-3xl" type="submit"
      >Submit</button
    >
  </form>
</div>
