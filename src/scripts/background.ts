import browser from "webextension-polyfill";

import {
  decryptCredentialFieldsHandler, initiateAuthHandler, savePassphraseHandler,
  decryptCredentialFieldsHandlerNew, loadWasmModule, addCredentialHandler,
  decryptFieldHandler, encryptFieldHandler, createShareCredsPayload,
  handlePvtKeyImport, credentialSubmitHandler, getCurrentDomain, sign_hashed_message
} from "./backgroundService";
import init, { is_global_context_set } from "./crypto_primitives";

let newCredential: any = {
  username: '',
  password: '',
  domain: '',
  windowId: ''
}




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

    case "hashAndSign": {
      const sign = await sign_hashed_message(request.data.message)
      return { signature: sign }
    }
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
      if (!request.data.domain) {
        return Promise.resolve({
          credIds: []
        })
      }
      for (let i = 0; i < request.data.urls.length; i++) {
        const decrypted = await decryptFieldHandler(request.data.urls[i].value);
        const normalizedDecrypted = decrypted.replace(/^www\./, '');

        if (urlObj.has(normalizedDecrypted)) {
          // @ts-ignore
          urlObj.get(normalizedDecrypted).add(request.data.urls[i].credentialId)
        } else {
          urlObj.set(normalizedDecrypted, new Set([request.data.urls[i].credentialId]))
        }
      }
      return Promise.resolve({
        credIds: Array.from(urlObj.get(request.data.domain.replace(/^www\./, '')) || [])

      });



    case "checkPvtLoaded":
      return is_global_context_set()
    case "decryptMeta":
      return decryptCredentialFieldsHandlerNew(request.data);
    case "addCredential":
      return addCredentialHandler(request.data);
    case "createShareCredPayload":
      return createShareCredsPayload(request.data.creds, request.data.users);
    case "credentialSubmit": {
      newCredential.username = request.data.username;
      newCredential.password = request.data.password;
      newCredential.domain = await getCurrentDomain();
      const credIds = Array.from(urlObj.get(newCredential.domain.replace(/^www\./, '')) || [])
      newCredential.windowId = await credentialSubmitHandler(newCredential, credIds)
      return true;

    }

    default:
      console.log(request.action)
      break;
  }
});


browser.runtime.onConnect.addListener(async (port) => {
  if (port.name === "popup") {
    // When you have data to send:
    if (newCredential && newCredential.username && newCredential.password) {
      port.postMessage({ username: newCredential.username, password: newCredential.password, domain: newCredential.domain, windowId: newCredential.windowId });
      newCredential = {};

    }
  }
});

function saveTimestamp() {

  const timestamp = new Date().toISOString();
  browser.storage.local.set({ timestamp });
}