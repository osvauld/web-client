import browser from "webextension-polyfill";
import { token, pvtKey } from "../lib/apis/temp";
// Listening for an installed event
browser.runtime.onInstalled.addListener(() => {
  console.log("Extension installed successfully!");

  // Handling the promise with .then and .catch
  browser.storage.local
    .set({ color: "#3aa757" })
    .then(() => {
      console.log("The color is green.");
    })
    .catch((error) => {
      console.error(`Error setting color: ${error}`);
    });
  browser.tabs.create({ url: browser.runtime.getURL("dashboard.html") });
  browser.storage.local.set({ token: token });
  browser.storage.local.set({ privateKey: pvtKey });
});
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openFullscreenTab") {
    browser.tabs.create({ url: browser.runtime.getURL("dashboard.html") });
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

browser.runtime.onMessage.addListener((request, sender) => {
  console.log("receieved message");
  if (request.eventName === "decrypt") {
    // Decrypt the data here
    // const decryptedData = decrypt(request.data);
    return Promise.resolve({ data: "decryptedData" });
  }
});
