<script lang="ts">
  import browser from "webextension-polyfill";
  import { onMount } from "svelte";
  export let name: string;

  const callBackgroundFunction = async (): Promise<void> => {
    try {
      const response = await browser.runtime.sendMessage({
        action: "someAction",
      });
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch color from storage
  const fetchColor = async (): Promise<void> => {
    try {
      const result = await browser.storage.local.get(["color"]);
      console.log("Color", result.color);
    } catch (error) {
      console.error("Error fetching color:", error);
    }
  };

  // Fetch color on component mount
  onMount(async () => {
    await fetchColor();
  });
</script>

<main>
  <h1 class="bg-red-800">Hello {name} !!</h1>
  <button class="bg-green-700" on:click={callBackgroundFunction}>
    Call Background Function
  </button>
  <button class="rounded bg-blue-500 px-4 py-2 text-base text-white">
    meh
  </button>
</main>
