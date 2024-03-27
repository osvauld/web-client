<script lang="ts">
  import { getRegsitrationChallenge } from "../../apis/auth.api";
  import Eye from "../basic/icons/eye.svelte";
  import { createEventDispatcher } from "svelte";
  import Loader from "../dashboard/components/Loader.svelte";

  const dispatch = createEventDispatcher();

  let username = "";
  let password = "";
  let showPassword = false;
  let showVerificationError = false;
  let isLoaderActive = false;

  $: type = showPassword ? "text" : "password";

  async function handleSubmit() {
    isLoaderActive = true;
    if (username && password) {
      const challengeResponse = await getRegsitrationChallenge(
        username,
        password
      );
      if (challengeResponse.data.challenge) {
        dispatch("setPassPhrase", {
          challenge: challengeResponse.data.challenge,
          username,
        });
        isLoaderActive = false;
      } else showVerificationError = true;
    }
  }
  function onInput(event: any) {
    password = event.target.value;
  }
  const togglePassword = () => {
    showPassword = !showPassword;
  };
</script>

<form
  class="flex flex-col justify-center items-center"
  on:submit|preventDefault={handleSubmit}
>
  <label for="username" class="font-normal mt-6">Enter Username</label>
  <div
    class="flex bg-osvauld-frameblack px-3 mt-4 border rounded-lg border-osvauld-iconblack"
  >
    <input
      class="text-white bg-osvauld-frameblack border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0"
      type="text"
      autocomplete="off"
      id="username"
      bind:value={username}
    />
  </div>

  <label for="password" class="font-normal mt-6">Enter Password</label>

  <div
    class="flex bg-osvauld-frameblack px-3 mt-4 border rounded-lg border-osvauld-iconblack"
  >
    <input
      class="text-white bg-osvauld-frameblack border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0"
      {type}
      autocomplete="off"
      id="password"
      on:input={onInput}
    />
    <button
      type="button"
      class="flex justify-center items-center"
      on:click={togglePassword}
    >
      <Eye />
    </button>
  </div>
  {#if showVerificationError}
    <span class="text-xs text-red-500 font-thin"
      >Wrong username or password</span
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
