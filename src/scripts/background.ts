import browser from "webextension-polyfill";
import { pvtKey, pubKey, encryptionPvtKey, encryptionPublicKey } from "../lib/apis/temp";
import { decryptCredentialFields, deriveKeyFromPassphrase, encryptPvtKeyWithSymmerticKey, generateECCKeyPairForSigning, generateRandomString, generateRSAKeyPairForEncryption, importECCPrivateKey } from "../lib/utils/crypto";
import { intiateAuth, verifyUser } from "../lib/utils/helperMethods";

browser.runtime.onInstalled.addListener(async () => {

  browser.tabs.create({ url: browser.runtime.getURL("dashboard.html") });
  // const pubKeyPair = await generateECCKeyPairForSigning() // Creating ECC key pair for signing please change
  // console.log(pubKeyPair);
  // await browser.storage.local.set({ token: token });
  await browser.storage.local.set({ privateKey: pvtKey });
  await browser.storage.local.set({ encryptionPvtKey: encryptionPvtKey });
  await browser.storage.local.set({ encryptionPubKey: encryptionPublicKey });
  // await browser.storage.local.set({ signPvtKey: pubKeyPair.privateKey });
  // await browser.storage.local.set({ signPubKey: pubKeyPair.publicKey });
});


browser.runtime.onMessage.addListener(async (request) => {

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
      const [tab]: any[] = await browser.tabs.query({ active: true, lastFocusedWindow: true });
      if (tab.length === 0) {
        throw new Error("No active tabs found");
      }

      await browser.tabs.sendMessage(tab.id, request);
    } catch (error: any) {
      console.error("Error:", error.message);
    }
  }
  if (request.action === "openFullscreenTab") {
    browser.tabs.create({ url: browser.runtime.getURL("dashboard.html") });
  }
  if (request.action === "credSubmitted") {
    let currentUrl = request.url;

    setTimeout(async () => {
      try {
        const [tab]: browser.Tabs.Tab[] = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tab && tab.id) {

          if (tab.url !== currentUrl) {

            await browser.tabs.sendMessage(tab.id, { action: "saveToVault", username: request.username, password: request.password });
          }
        }
      } catch (error) {
        console.error("Error querying tabs:", error);
      }
    }, 3000);
  }

  if (request.action === "initiate_auth") {
    // const signPvtKeyObj = await browser.storage.local.get("signPvtKey");
    // const signPubKeyObj = await browser.storage.local.get("signPubKey");
    const signPrivateKey = await importECCPrivateKey(pvtKey);
    const token = await intiateAuth(signPrivateKey, pubKey);
    if (token) {
      await browser.storage.local.set({ token: token });
      return Promise.resolve({ isAuthenticated: true })
    } else {
      return Promise.resolve({ isAuthenticated: false })
    }

  }

  if (request.action === "check_is_signed_up") {
    const signPvtKeyObj = await browser.storage.local.get("signPvtKey");
    if (signPvtKeyObj.signPvtKey) return Promise.resolve({ isSignedUp: true })
    else return Promise.resolve({ isSignedUp: false })
  }

  if (request.action === "sign_up_user") {
    if (request.username && request.password) {
      const rsaKeyPair = await generateRSAKeyPairForEncryption()
      const eccKeyPair = await generateECCKeyPairForSigning()
      const isValidCreds = await verifyUser(request.username, request.password, rsaKeyPair.publicKey || "", eccKeyPair.publicKey || "")
      if (isValidCreds) {
        return Promise.resolve({ isAuthenticated: true, rsaKey: rsaKeyPair, eccKey: eccKeyPair })
      }
    }
  }

  if (request.action === "save_passphrase") {
    if (request.passphrase) {
      const saltString = generateRandomString()
      browser.storage.local.set({ passphraseSalt: saltString });
      const symmetricKey = await deriveKeyFromPassphrase(request.passphrase, saltString)
      const ivString = generateRandomString()
      browser.storage.local.set({ passphraseIv: ivString });
      if (request.rsaKey.privateKey) {
        const pvtKeyCipher = await encryptPvtKeyWithSymmerticKey(symmetricKey, request.rsaKey.privateKey, ivString)
        await browser.storage.local.set({ encryptionPvtKey: pvtKeyCipher });
      }
      if (request.eccKey.privateKey) {
        const pvtKeyCipher = await encryptPvtKeyWithSymmerticKey(symmetricKey, request.eccKey.privateKey, ivString)
        await browser.storage.local.set({ signPvtKey: pvtKeyCipher });
      }
      return Promise.resolve({ isSaved: true })
    }
  }
});
