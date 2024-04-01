import browser from "webextension-polyfill";

import {
  decryptCredentialFieldsHandler, initiateAuthHandler, savePassphraseHandler,
  decryptCredentialFieldsHandlerNew, loadWasmModule, addCredentialHandler,
  decryptFieldHandler, encryptFieldHandler, createShareCredsPayload,
  handlePvtKeyImport
} from "./backgroundService";
import { fetchCredsByIds } from "../lib/apis/credentials.api"
import { InjectionPayload } from "../lib/dtos/credential.dto";
import init, { is_global_context_set } from "./rust_openpgp_wasm";


let urlObj = new Map<string, Set<string>>();


browser.runtime.onInstalled.addListener(async () => {
  browser.tabs.create({ url: browser.runtime.getURL("dashboard.html") });
});


browser.runtime.onMessage.addListener(async (request) => {

  switch (request.action) {
    case "decrypt": {
      return decryptCredentialFieldsHandler(request.data);
    }
    case "decryptField": {
      const field = await decryptFieldHandler(request.data)
      return { data: field }
    }

    case "encryptFields": {
      return encryptFieldHandler(request.data.fields, request.data.publicKey)
    }


    case "openFullscreenTab":
      browser.tabs.create({ url: browser.runtime.getURL("dashboard.html") });
      break;


    case "initiateAuth": {
      try {

        const passphrase = request.data.passphrase;
        await loadWasmModule();
        await initiateAuthHandler(passphrase)
        return { isAuthenticated: true }
      } catch (error) {
        return { isAuthenticated: false, error: error.message }
      }
    }

    case "isSignedUp": {
      const signPvtKeyObj = await browser.storage.local.get("signPvtKey");
      await init();
      const SAVE_TIMESTAMP_INTERVAL_MS = 2 * 1000;
      saveTimestamp();
      setInterval(saveTimestamp, SAVE_TIMESTAMP_INTERVAL_MS);
      if (signPvtKeyObj.signPvtKey) return { isSignedUp: true }
      else return { isSignedUp: false }

    }

    case "importPvtKey": {
      await handlePvtKeyImport(request.data.privateKeys, request.data.passphrase);
      return;
    }


    case "savePassphrase":
      if (request.data.passphrase) {
        return savePassphraseHandler(request.data.passphrase, request.data.challenge, request.data.username)
      }
      break;
    case "updateAllUrls":
      for (let i = 0; i < request.data.urls.length; i++) {
        const decrypted = await decryptFieldHandler(request.data.urls[i].value);
        if (urlObj.has(decrypted)) {
          // @ts-ignore
          urlObj.get(decrypted).add(request.data.urls[i].credentialId)
        } else {
          urlObj.set(decrypted, new Set([request.data.urls[i].credentialId]))
        }
      }
      return Promise.resolve({
        credIds: Array.from(urlObj.get(request.data.domain) || [])

      });



    case "checkPvtLoaded":
      return is_global_context_set()
    case "decryptMeta":
      return decryptCredentialFieldsHandlerNew(request.data);
    case "addCredential":
      return addCredentialHandler(request.data);
    case "createShareCredPayload":
      return createShareCredsPayload(request.data.creds, request.data.users);

    default:
      console.log(request.action)
      break;
  }
});



browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Log for debugging

  // Check if the tab status is 'complete'
  if (changeInfo.status === 'complete') {
    // Get the current tab URL directly from the tab object
    let url: URL;
    let domain: string = '';
    if (tab.url) {
      url = new URL(tab.url);
      domain = url.hostname;
    }
    // Check if the domain is in your list
    if (urlObj.has(domain)) {
      // @ts-ignore
      const responseData = await fetchCredsByIds([...urlObj.get(domain)]);
      // TODO: payload change in future
      const payload: InjectionPayload[] = [];
      for (const cred of responseData.data) {
        for (const field of cred.fields) {
          if (field.fieldName === 'Username') {
            const decrypted = await decryptFieldHandler(field.fieldValue);
            payload.push({ id: cred.credentialId, username: decrypted });
          }
        }
      }
      try {
        await browser.tabs.sendMessage(tabId, { action: "updateCredsList", creds: payload });
      } catch (error) {
        console.error("Error sending message to tab:", error);
      }
    } else {
      console.log('Domain is not in the URLs array:', domain);
    }
  }
});

function saveTimestamp() {

  console.log('stroing timestamp')
  const timestamp = new Date().toISOString();
  browser.storage.local.set({ timestamp });
}