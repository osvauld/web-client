<script lang="ts">
  import browser from "webextension-polyfill";
  import { onMount } from "svelte";
  import Welcome from "./components/popup/Welcome.svelte";
  import Home from "./components/popup/Home.svelte";
  import Logo from "./components/basic/logo.svelte";
  import { isLoggedIn } from "../lib/store/ui.store";
  console.log("is logged in status", $isLoggedIn);
  let devType = "dahs";

  onMount(async () => {
    if (devType != "popup") openFullscreenTab();
  });

  const openFullscreenTab = async () => {
    // Send a message to the background sdaash
    console.log("Opening fullscreen tab");
    await browser.runtime.sendMessage({ action: "openFullscreenTab" });
  };
</script>

<main>
  <div class="w-[380px] h-[520px] bg-[#262C44] overflow-hidden">
    {#if $isLoggedIn}
      <Home />
    {:else}
      <div>
        <div class="h-[200px] w-full flex justify-center items-center pl-7">
          <Logo />
        </div>
        <Welcome />
      </div>
    {/if}
  </div>
</main>
