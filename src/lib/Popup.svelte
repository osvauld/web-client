<script lang="ts">
  import browser from "webextension-polyfill";
  import { onMount } from "svelte";
  import Welcome from "./components/popup/Welcome.svelte";
  import Home from "./components/popup/Home.svelte";
  import Logo from "./components/basic/logo.svelte";
  import { isLoggedIn, isSignedUp } from "../lib/store/ui.store";
  import Signup from "./components/popup/Signup.svelte";
  let devType = "popup";
  let loggedIn = false;
  onMount(async () => {
    if (devType != "popup") openFullscreenTab();
    const response = await browser.runtime.sendMessage({
      action: "isSignedUp",
    });
    isSignedUp.set(response.isSignedUp);
    const checkPvtLoad = await browser.runtime.sendMessage({
      action: "checkPvtLoaded",
    });
    console.log(checkPvtLoad);
    if (checkPvtLoad.isLoaded) {
      loggedIn = true;
    } else {
      loggedIn = false;
    }
    // isSignedUp.set(false);
  });

  const openFullscreenTab = async () => {
    // Send a message to the background sdaash
    await browser.runtime.sendMessage({ action: "openFullscreenTab" });
  };

  const checkAuth = (event) => {
    console.log("check auth event...", event);
    loggedIn = event.detail;
  };
</script>

<main>
  <div class="w-[380px] h-[520px] bg-[#262C44] overflow-hidden">
    {#if !$isSignedUp}
      <Signup />
    {:else if loggedIn}
      <Home />
    {:else}
      <div>
        <div class="h-[200px] w-full flex justify-center items-center pl-7">
          <Logo />
        </div>
        <Welcome on:authenticated={checkAuth} />
      </div>
    {/if}
  </div>
</main>
