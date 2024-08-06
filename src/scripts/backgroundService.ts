import browser from "webextension-polyfill";
import {
	createChallenge,
	finalRegistration,
	initiateAuth,
} from "../lib/apis/auth.api";
import { fetchCredsByIds } from "../lib/apis/credentials.api";
import {
	Credential,
	CredentialFields,
	Field,
	UserEncryptedFields,
	UsersForDataSync,
} from "../lib/dtos/credential.dto";
import init, {
	generate_and_encrypt_keys,
	sign_message,
	decrypt_and_store_keys,
	sign_message_with_stored_key,
	encrypt_new_credential,
	decrypt_credentials,
	decrypt_text,
	encrypt_fields,
	get_pub_key,
	sign_hash_message,
	generate_keys_without_password,
	encrypt_field_value,
	decrypt_urls,
} from "./crypto_primitives.js";
import { User } from "../lib/dtos/user.dto.js";

type CredentialsForUsersPayload = {
	accessType?: string;
	userId: string;
	credentials: CredentialFields[];
};
type UserListForEncryption = {
	id: string;
	publicKey: string;
	accessType?: string;
};

export const initiateAuthHandler = async (
	passphrase: string,
): Promise<string> => {
	const encryptionPvtKeyObj =
		await browser.storage.local.get("encryptionPvtKey");
	const signPvtKeyObj = await browser.storage.local.get("signPvtKey");
	const encryptionKey = encryptionPvtKeyObj.encryptionPvtKey;
	const signKey = signPvtKeyObj.signPvtKey;
	const startTime = performance.now();
	const cacheObj = decrypt_and_store_keys(encryptionKey, signKey, passphrase);
	const pubKeyObj = await browser.storage.local.get("signPublicKey");
	console.log(
		"Time taken to decrypt and store keys:",
		performance.now() - startTime,
	);
	const challengeResponse = await createChallenge(pubKeyObj.signPublicKey);
	await cacheObj;
	const signedMessage = await sign_message_with_stored_key(
		challengeResponse.data.challenge,
	);
	const verificationResponse = await initiateAuth(
		signedMessage,
		pubKeyObj.signPublicKey,
	);
	const token = verificationResponse.data.token;
	if (token) {
		await browser.storage.local.set({ token: token });
		await browser.storage.local.set({ isLoggedIn: true });
	}
	return token;
};

export const savePassphraseHandler = async (
	passphrase: string,
	challenge: string,
	username: string,
) => {
	await init();
	const keyPair = await generate_and_encrypt_keys(passphrase, username);
	await browser.storage.local.set({
		encryptionPvtKey: keyPair.get("enc_private_key"),
		signPvtKey: keyPair.get("sign_private_key"),
		encPublicKey: keyPair.get("enc_public_key"),
		signPublicKey: keyPair.get("sign_public_key"),
	});
	const signature = await sign_message(
		keyPair.get("sign_private_key"),
		passphrase,
		challenge,
	);
	await finalRegistration(
		username,
		signature,
		keyPair.get("sign_public_key"),
		keyPair.get("enc_public_key"),
	);
	return { isSaved: true };
};

export const decryptCredentialFieldsHandler = async (
	credentials: Credential[],
) => {
	const response: Credential[] = await decrypt_credentials(credentials);
	return { data: response };
};

export const addCredentialHandler = async (payload: {
	users: UsersForDataSync[];
	addCredentialFields: Field[];
}): Promise<UserEncryptedFields[]> => {
	return await encrypt_new_credential(
		payload.users,
		payload.addCredentialFields,
	);
};

export const decryptFieldHandler = async (text: string) => {
	const decrypted = await decrypt_text(text);
	return decrypted;
};

export const encryptFieldHandler = async (fields: any, publicKey: string) => {
	try {
		const response = await encrypt_fields(fields, publicKey);
		return { data: response };
	} catch (error) {
		console.error("Error encrypting fields:", error);
	}
};

export const loadWasmModule = async () => {
	try {
		await init();
	} catch (error) {
		console.error(
			"Error loading WASM module or processing encryption/decryption:",
			error,
		);
	}
};

export const encryptCredentialsForUser = async (
	credentials: CredentialFields[],
	publicKeyStr: string,
): Promise<CredentialFields[]> => {
	const encryptedCredsForUser: CredentialFields[] = [];
	for (const credential of credentials) {
		const encryptedCred: CredentialFields = {
			credentialId: credential.credentialId,
			fields: [],
		};
		encryptedCred.credentialId = credential.credentialId;
		const response = await encryptFieldHandler(credential.fields, publicKeyStr);
		encryptedCred.fields = response.data;
		encryptedCredsForUser.push(encryptedCred);
	}
	return encryptedCredsForUser;
};

export const createShareCredsPayload = async (
	creds: CredentialFields[],
	selectedUsers: UserListForEncryption[],
): Promise<CredentialsForUsersPayload[]> => {
	const response = await decryptCredentialFieldsHandler(creds);
	const userData: CredentialsForUsersPayload[] = [];
	for (const user of selectedUsers) {
		const userEncryptedFields = await encryptCredentialsForUser(
			response.data,
			user.publicKey,
		);
		if (user.accessType) {
			userData.push({
				userId: user.id,
				credentials: userEncryptedFields,
				accessType: user.accessType,
			});
		} else {
			userData.push({
				userId: user.id,
				credentials: userEncryptedFields,
			});
		}
	}
	return userData;
};

export const handlePvtKeyImport = async (
	pvtKeys: string,
	passphrase: string,
) => {
	await init();
	const { encryptionKey, signKey, baseUrl } = JSON.parse(pvtKeys);
	await browser.storage.local.set({ baseUrl });
	const signPubKey = await get_pub_key(signKey);
	const encPublicKey = await get_pub_key(encryptionKey);

	const challegeResult = await createChallenge(signPubKey);
	await decrypt_and_store_keys(encryptionKey, signKey, passphrase);
	const signedMessage = await sign_message_with_stored_key(
		challegeResult.data.challenge,
	);
	const verificationResponse = await initiateAuth(signedMessage, signPubKey);
	const token = verificationResponse.data.token;
	if (token) {
		await browser.storage.local.set({ token: token });
		await browser.storage.local.set({ isLoggedIn: true });
	}
	await browser.storage.local.set({
		encryptionPvtKey: encryptionKey,
		signPvtKey: signKey,
		encPublicKey: encPublicKey,
		signPublicKey: signPubKey,
	});

	return token;
};

export const credentialSubmitHandler = async (
	newCredential: any,
	credIds: string[],
) => {
	if (credIds.length > 0) {
		const responseJson = await fetchCredsByIds(credIds);
		const listedCredentials = responseJson.data;
		const decryptedData =
			await decryptCredentialFieldsHandler(listedCredentials);
		if (decryptedData) {
			for (const credential of decryptedData.data) {
				for (const field of credential.fields) {
					if (field.fieldName == "Username") {
						if (field.fieldValue == newCredential.username) {
							return null;
						}
					}
				}
			}
		}
	}
	const windowDetails = await browser.windows.create({
		url: browser.runtime.getURL("popup.html"),
		type: "popup",
		width: 290,
		height: 500,
	});
	return windowDetails.id;
};
export const getCurrentDomain = async () => {
	try {
		const queryOptions = { active: true, currentWindow: true };
		const tabs = await browser.tabs.query(queryOptions);
		if (tabs[0] && tabs[0].url) {
			const url = new URL(tabs[0].url);
			return url; // Returns the domain of the current active tab
		}
		return null;
	} catch (error) {
		console.error("Error getting current domain:", error);
		return null;
	}
};

export const sign_hashed_message = async (message: string): Promise<string> => {
	const response = await sign_hash_message(message);
	return response;
};

export const generateCliKeys = async (username: string) => {
	const response = await generate_keys_without_password(username);
	const returnObj = Object.fromEntries(response);
	return returnObj;
};

export const encryptEditFields = async (data: any) => {
	const encryptedFields = await encrypt_field_value(
		data.fieldValue,
		data.usersToShare,
	);
	const encryptedFieldsObject = encryptedFields.map((field) =>
		Object.fromEntries(field),
	);
	return encryptedFieldsObject;
};

export const getDecryptedUrls = async (urls: any) => {
	const decryptedUrls = await decrypt_urls(urls);
	return decryptedUrls;
};
