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
browser.runtime.onMessage.addListener((message) => {
  if (message.action === "openFullscreenTab") {
    browser.tabs.create({ url: browser.runtime.getURL("dashboard.html") });
  }
});

//Below function redirects message from popup to active tab content script

browser.runtime.onMessage.addListener(async function (request) {
  if (request.action === "fillingSignal") {
    try {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs.length === 0) {
        throw new Error("No active tabs found");
      }
      if (tabs[0] && tabs[0].id) {
        await browser.tabs.sendMessage(tabs[0].id, request);
      }
    } catch (error: any) {
      console.error("Error:", error.message);
    }
  }
});

// Listening for a specific message
browser.runtime.onMessage.addListener((request) => {
  // Return a promise as a response
  return Promise.resolve({ result: "Action completed" });
});

function performSomeAction(): void {
  console.log("Performed some action");
}
// browser.runtime.onMessage.addListener(async function (msg) {
//   if (msg.action == "decrypt") {
//     let { idPattern } = await browser.storage.local.get("privateKey");

//     return Array.from(
//       document.querySelectorAll(idPattern),
//       (elem) => elem.textContent
//     );
//   }
// });
// browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   return browser.storage.local.get("privateKey").then((privateKeyObj) => {
//     const privateKey = privateKeyObj.privateKey;
//     if (request.eventName === "decrypt") {
//       console.log("decrypting.....");
//       return decryptCredentialFields(request.data, privateKey);
//     }
//     return true; // Indicate that the response will be sent asynchronously
//   });
// });
