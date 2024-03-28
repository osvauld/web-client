

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


chrome.runtime.onInstalled.addListener(async () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
});


chrome.runtime.onMessage.addListener(async (request) => {

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

    case "fillingSignal":
      {
        const [tab]: any[] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        await chrome.tabs.sendMessage(tab.id, request);
        break;
      }

    case "openFullscreenTab":
      chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
      break;

    case "credSubmitted": {
      let currentUrl = request.url;
      setTimeout(async () => {
        try {
          const [tab]: chrome.Tabs.Tab[] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
          });
          if (tab && tab.id) {
            if (tab.url !== currentUrl) {
              await chrome.tabs.sendMessage(tab.id, { action: "saveToVault", username: request.username, password: request.password });
            }
          }
        } catch (error) {
          console.error("Error querying tabs:", error);
        }
      }, 3000);
    }
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
      const signPvtKeyObj = await chrome.storage.local.get("signPvtKey");
      console.log(signPvtKeyObj.signPvtKey);
      try {

        await init();
      } catch (error) {
        console.log(error);
      }
      const SAVE_TIMESTAMP_INTERVAL_MS = 2 * 1000;

      saveTimestamp();
      setInterval(saveTimestamp, SAVE_TIMESTAMP_INTERVAL_MS);
      if (signPvtKeyObj.signPvtKey) return { isSignedUp: true }
      else return { isSignedUp: false }
    }

    case "importPvtKey": {
      await handlePvtKeyImport(request.privateKeys, request.passphrase);
      return;
    }


    case "savePassphrase":
      if (request.passphrase) {
        return savePassphraseHandler(request.passphrase, request.challenge, request.username)
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
      console.log('check pvt load')
      return is_global_context_set()
    case "getActiveCredSuggestion": {
      let tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const activeTab = tabs[0];
      let url: URL | undefined;
      if (activeTab && activeTab.url) {
        url = new URL(activeTab.url);
      }
      const domain = url?.hostname;
      // @ts-ignore
      const credentialIds = [...urlObj.get(domain)];
      const responseJson = await fetchCredsByIds(credentialIds);
      let username = "";
      let password = "";
      for (const cred of responseJson.data) {
        if (cred.credentialId === request.data) {
          for (let field of cred.fields) {
            if (field.fieldName === 'Username') {
              username = await decryptFieldHandler(field.fieldValue);
            } else if (field.fieldName === 'Password') {
              password = await decryptFieldHandler(field.fieldValue);
            }
          }
        }
      }
      return Promise.resolve({ username, password });
    }
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



chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
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
        await chrome.tabs.sendMessage(tabId, { action: "updateCredsList", creds: payload });
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
  chrome.storage.local.set({ timestamp });
}