<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import browser from "webextension-polyfill";
  import { sendMessage } from "./components/dashboard/helper";
  import AddCredential from "./components/popup/AddCredential.svelte";

  let loggedIn = true;
  let isSignedUp = false;
  let port: browser.Runtime.Port;
  let newCredential: any | null = {
    username: "",
    password: "",
    domain: "",
    windowId: "",
  };
  onMount(async () => {
    const response = await sendMessage("isSignedUp");
    isSignedUp = response.isSignedUp;
    const checkPvtLoad = await sendMessage("checkPvtLoaded");
    if (checkPvtLoad) {
      loggedIn = true;
    } else {
      loggedIn = false;
    }
    port = browser.runtime.connect({ name: "popup" });
    port.onMessage.addListener(handleMessage);
  });
  const handleMessage = (msg) => {
    if (msg.username && msg.password) {
      newCredential = msg;
    }
  };
  onDestroy(() => {
    port.disconnect();
    port.onMessage.removeListener(handleMessage);
  });
</script>

{#if isSignedUp && loggedIn}
  <main>
    <div
      class="w-[22.5rem] h-[36.78rem] p-2 pt-3 flex flex-col !font-sans justify-start items-center bg-osvauld-frameblack"
    >
      <AddCredential
        username={newCredential.username}
        password={newCredential.password}
        domain={newCredential.domain}
        windowId={newCredential.windowId}
      />
    </div>
  </main>
{/if}
