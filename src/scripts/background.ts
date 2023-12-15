import browser from "webextension-polyfill";
import { token, pvtKey } from "../lib/apis/temp";
import { decryptCredentialFields } from "../lib/utils/crypto";
// Listening for an installed event
browser.runtime.onInstalled.addListener(async () => {
  console.log("Extension installed successfully!");

  browser.tabs.create({ url: browser.runtime.getURL("dashboard.html") });
  await browser.storage.local.set({ token: token });
  await browser.storage.local.set({ privateKey: pvtKey });
});
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openFullscreenTab") {
    browser.tabs.create({ url: browser.runtime.getURL("dashboard.html") });
  }
});

//Below function redirects message from popup to active tab content script

browser.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.action === "fillingSignal") {
    try {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs.length === 0) {
        throw new Error("No active tabs found");
      }
      await browser.tabs.sendMessage(tabs[0].id, request);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }
});

// Listening for a specific message
browser.runtime.onMessage.addListener((request) => {
  if (request.message === "clicked_browser_action") {
    console.log("Browser action clicked!");

    // Example: Send a message to the content script
    void browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        if (tabs.length > 0) {
          var activeTab = tabs[0];
          if (activeTab.id) {
            void browser.tabs.sendMessage(activeTab.id, {
              message: "clicked_browser_action",
            });
          }
        }
      })
      .catch((error) => {
        console.error(`Error: ${error}`);
      });
  }

  if (request.action === "someAction") {
    // Perform the action
    performSomeAction();

    // Return a promise as a response
    return Promise.resolve({ result: "Action completed" });
  }

  return undefined;
});

function performSomeAction(): void {
  console.log("Performed some action");
}

browser.runtime.onMessage.addListener(async (request, sender) => {
  console.log("receieved message");
  const privateKeyObj = await browser.storage.local.get("privateKey");
  const privateKey = privateKeyObj.privateKey;
  if (request.eventName === "decrypt") {
    const decrypted = await decryptCredentialFields(request.data, privateKey);
    // Decrypt the data here
    // const decryptedData = decrypt(request.data);
    return Promise.resolve({ data: decrypted });
  }
});
