<script lang="ts">
  // import browser from "webextension-polyfill";
  // import { onMount } from "svelte";
  import Welcome from './components/popup/Welcome.svelte';
  import Logo from "./components/basic/logo.svelte"
  import { isLoggedIn } from '../lib/store/ui.store';

  console.log('is logged in status', $isLoggedIn)
  // export let name: string;

  // const callBackgroundFunction = async (): Promise<void> => {
  //   try {
  //     const response = await browser.runtime.sendMessage({
  //       action: "someAction",
  //     });
  //     console.log(response);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // Fetch color from storage
  // const fetchColor = async (): Promise<void> => {
  //   try {
  //     const result = await browser.storage.local.get(["color"]);
  //     console.log("Color", result.color);
  //   } catch (error) {
  //     console.error("Error fetching color:", error);
  //   }
  // };

  // Fetch color on component mount
  // onMount(async () => {
  //   await fetchColor();
  //  // openFullscreenTab();
  // });

  // const openFullscreenTab = async () => {
  //   // Send a message to the background script
  //   console.log("Opening fullscreen tab");
  //   await browser.runtime.sendMessage({ action: "openFullscreenTab" });
  // };
</script>

<main>
  <!-- <h1 class="bg-green-800">Hello {name} !!</h1>
  <button class="bg-green-700" on:click={callBackgroundFunction}>
    Call Background Function
  </button> -->
  <!-- <button
    class="rounded bg-blue-500 px-4 py-2 text-base text-white"
    on:click={openFullscreenTab}
  >
    Open Fullscreen Tab
  </button> -->

  <div class="w-[380px] h-[520px] flex flex-col justify-start items-center bg-[#262C44]">
    {#if $isLoggedIn}
      <div>
        <p class="text-white font-bold text-3xl">Credentials</p>
      </div>
    {:else}
      <div >
        <div class="h-[200px] w-full flex justify-center items-center pl-7">
          <Logo />
        </div>
        <Welcome/>
      </div>
    {/if}
  </div>
</main>

 