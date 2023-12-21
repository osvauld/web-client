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


browser.runtime.onMessage.addListener(async (request) => {
  console.log("receieved message");
  const privateKeyObj = await browser.storage.local.get("privateKey");
  const privateKey = privateKeyObj.privateKey;
  if (request.eventName === "decrypt") {
    const decrypted = await decryptCredentialFields(request.data, privateKey);
    // Decrypt the data here
    // const decryptedData = decrypt(request.data);
    return Promise.resolve({ data: decrypted });
  }
  if (request.action === "fillingSignal") {
    try {
      const tabs: any[] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs.length === 0) {
        throw new Error("No active tabs found");
      }
      await browser.tabs.sendMessage(tabs[0].id, request);
    } catch (error: any) {
      console.error("Error:", error.message);
    }
  }

  if (request.action === "openFullscreenTab") {
    browser.tabs.create({ url: browser.runtime.getURL("dashboard.html") });
  }
});


browser.runtime.onMessage.addListener(async (request, sender) => {
  if (request.action === "credSubmitted") {
    let currentUrl = request.url;
    setTimeout(async () => {
      try {
        const tabs = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (tabs[0].url === currentUrl) {
          console.log('Url same');
         // browser.runtime.sendMessage({ action: "url changed" });
        } else {
          console.log('Url changed');
          //browser.runtime.sendMessage({ action: "sam urle" });
        }
      } catch (error) {
        console.error("Error querying tabs:", error);
      }
    }, 3000);
  }
});
