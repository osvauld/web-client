<script lang="ts">
  import browser from "webextension-polyfill";
  import { onMount } from "svelte";
  import Welcome from "./components/popup/Welcome.svelte";
  import Home from "./components/popup/Home.svelte";
  import { Logo } from "./components/dashboard/icons";
  import { isLoggedIn, isSignedUp } from "../lib/store/ui.store";
  import Signup from "./components/popup/Signup.svelte";

  let devType = "popup";
  let loggedIn = true;
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
  <div
    class="w-[22.5rem] min-h-[37.78rem] p-2 pt-3 flex flex-col  {$isSignedUp && !loggedIn ? "justify-center": "justify-start"} items-center bg-osvauld-frameblack"
  >
    {#if !$isSignedUp}
      <Signup />
    {:else if loggedIn}
      <Home />
    {:else}
        <div class="mb-12 flex justify-center items-center">
          <Logo />
        </div>
        <Welcome on:authenticated={checkAuth} />
    {/if}
  </div>
</main>
