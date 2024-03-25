<script lang="ts">
  import Eye from "../basic/icons/eye.svelte";
  import Loader from "../dashboard/components/Loader.svelte";
  import { ClosedEye } from "./icons";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  let privateKeys = "";
  let passphrase = "";
  let showPassword = false;
  let isLoaderActive = false;

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  function handleInputChange(event, field) {
    if (field === "privateKey") {
      privateKeys = event.target.value;
    } else if (field === "passphrase") {
      passphrase = event.target.value;
    }
  }

  function handleSubmit() {
    isLoaderActive = true;
    dispatch("submit", { privateKeys, passphrase });
  }
</script>

<div
  class="flex flex-col justify-center items-center text-osvauld-sheffieldgrey"
>
  <div>
    <h3 class="font-medium text-3xl mb-6 text-osvauld-ownerText">
      Account Recovery
    </h3>
  </div>
  <label for="privateKey" class="font-normal mt-6 mb-2"
    >Enter Recovery string</label
  >
  <textarea
    class="text-osvauld-quarzowhite bg-osvauld-frameblack border border-osvauld-iconblack tracking-wider font-light text-sm font-mono focus:border-osvauld-iconblack focus:ring-0 resize-none w-[300px] min-h-[6rem] max-h-[10rem] rounded-lg scrollbar-thin overflow-y-scroll"
    id="privateKey"
    on:input={(e) => handleInputChange(e, "privateKey")}
  />

  <label for="passphrase" class="font-normal mt-6 mb-2">Enter Passphrase</label>
  <div
    class="flex justify-between items-center bg-osvauld-frameblack px-3 border rounded-lg border-osvauld-iconblack w-[300px]"
  >
    <input
      class="text-white bg-osvauld-frameblack border-0 tracking-wider font-normal border-transparent focus:border-osvauld-iconblack focus:ring-0 active:outline-none focus:ring-offset-0"
      type={showPassword ? "text" : "password"}
      id="passphrase"
      on:input={(e) => handleInputChange(e, "passphrase")}
    />

    <button
      type="button"
      class="flex justify-center items-center"
      on:click={togglePasswordVisibility}
    >
      {#if showPassword}
        <ClosedEye />
      {:else}
        <Eye />
      {/if}
    </button>
  </div>
  <button
    class="bg-osvauld-carolinablue py-2 px-10 mt-8 rounded-lg text-osvauld-ninjablack font-medium w-[150px] flex justify-center items-center whitespace-nowrap"
    type="button"
    on:click={handleSubmit}
  >
    {#if isLoaderActive}
      <Loader />
    {:else}
      <span>Submit</span>
    {/if}
  </button>
</div>
