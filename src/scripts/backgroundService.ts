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
	EncryptedEditField,
	Field,
	UserEncryptedFields,
	UsersForDataSync,
	CapturedCredentialData,
} from "../lib/dtos/credential.dto";
import init, {
	generate_and_encrypt_keys,
	decrypt_and_store_keys,
	sign_message,
	encrypt_new_credential,
	decrypt_credentials,
	decrypt_text,
	encrypt_fields,
	get_public_key,
	sign_and_hash_message,
	generate_keys_without_password,
	encrypt_field_value,
	export_certificate,
	decrypt_urls,
	decrypt_fields,
	import_certificate,
} from "./wasm";
import { StorageService } from "./storageHelper";
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
	const certificate = await StorageService.getCertificate();
	const salt = await StorageService.getSalt();
	const startTime = performance.now();
	if (certificate && salt) {
		await decrypt_and_store_keys(certificate, salt, passphrase);
	} else {
		throw Error("failed to fetch certificate and salt from storage");
	}
	const pubKey = await get_public_key();
	console.log(
		"Time taken to decrypt and store keys:",
		performance.now() - startTime,
	);
	const challengeResponse = await createChallenge(pubKey);
	const signedMessage = await sign_message(challengeResponse.data.challenge);
	const verificationResponse = await initiateAuth(signedMessage, pubKey);
	const token = verificationResponse.data.token;
	if (token) {
		await StorageService.setToken(token);
		await StorageService.setIsLoggedIn("true");
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
	StorageService.setCertificate(keyPair.get("certificate"));
	StorageService.setSalt(keyPair.get("salt"));
	decrypt_and_store_keys(
		keyPair.get("certificate"),
		keyPair.get("salt"),
		passphrase,
	);

	const signature = await sign_message(challenge);
	await finalRegistration(
		username,
		signature,
		keyPair.get("public_key"),
		keyPair.get("public_key"),
	);
	return { isSaved: true };
};

export const decryptCredentialFieldsHandler = async (
	credentials: Credential[],
) => {
	const response: Credential[] = await decrypt_credentials(credentials);
	return response;
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

export const decryptFieldHandler = async (text: string): Promise<string> => {
	const decrypted = await decrypt_text(text);
	return decrypted;
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
		encryptedCred.fields = await encrypt_fields(
			credential.fields,
			publicKeyStr,
		);
		encryptedCredsForUser.push(encryptedCred);
	}
	return encryptedCredsForUser;
};

export const createShareCredsPayload = async (
	creds: any,
	selectedUsers: any,
): Promise<CredentialsForUsersPayload[]> => {
	const decryptedFields = await decrypt_fields(creds);
	const userData: CredentialsForUsersPayload[] = [];
	for (const user of selectedUsers) {
		const userEncryptedFields = await encryptCredentialsForUser(
			decryptedFields,
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

export const getCertificate = async (passphrase: string) => {

	const pvtKey = await StorageService.getCertificate();
	const salt = await StorageService.getSalt();
	if (pvtKey && salt) {
		const response = await export_certificate(passphrase, pvtKey, salt);
		console.log(response);
		return response
		// const new_response = await import_certificate(response, "test");
		// return new_response
	}
}

export const handlePvtKeyImport = async (
	pvtKeys: string,
	passphrase: string,
) => {
	await init();
	// const { encryptionKey, signKey, baseUrl } = JSON.parse(pvtKeys);
	// await browser.storage.local.set({ baseUrl });
	// const signPubKey = await get_pub_key(signKey);
	// const encPublicKey = await get_pub_key(encryptionKey);

	// const challegeResult = await createChallenge(signPubKey);
	// await decrypt_and_store_keys(encryptionKey, signKey, passphrase);
	// const signedMessage = await sign_message_with_stored_key(
	// 	challegeResult.data.challenge,
	// );
	// const verificationResponse = await initiateAuth(signedMessage, signPubKey);
	// const token = verificationResponse.data.token;
	// if (token) {
	// 	await browser.storage.local.set({ token: token });
	// 	await browser.storage.local.set({ isLoggedIn: true });
	// }
	// await browser.storage.local.set({
	// 	encryptionPvtKey: encryptionKey,
	// 	signPvtKey: signKey,
	// 	encPublicKey: encPublicKey,
	// 	signPublicKey: signPubKey,
	// });

	// return token;
};

export const credentialSubmitHandler = async (
	newCredential: CapturedCredentialData,
	credIds: string[],
) => {
	if (credIds.length > 0) {
		const responseJson = await fetchCredsByIds(credIds);
		const listedCredentials = responseJson.data;
		const decryptedData =
			await decryptCredentialFieldsHandler(listedCredentials);
		if (decryptedData) {
			for (const credential of decryptedData) {
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

	return true;
};
export const getCurrentDomain = async () => {
	const queryOptions = { active: true, currentWindow: true };
	const tabs = await browser.tabs.query(queryOptions);
	const url = new URL(tabs[0].url!);
	return url; // Returns the domain of the current active tab
};

export const sign_hashed_message = async (message: string): Promise<string> => {
	const response = await sign_and_hash_message(message);
	return response;
};

export const generateCliKeys = async (username: string) => {
	const response = await generate_keys_without_password(username);
	const returnObj = Object.fromEntries(response);
	return returnObj;
};

export const encryptEditFields = async (data: {
	fieldValue: string;
	usersToShare: { userId: string; publicKey: string }[];
}): Promise<EncryptedEditField[]> => {
	const encryptedFields = await encrypt_field_value(
		data.fieldValue,
		data.usersToShare,
	);
	const encryptedFieldsObject = encryptedFields.map((field: any) =>
		Object.fromEntries(field),
	);
	return encryptedFieldsObject;
};

export const getDecryptedUrls = async (urls: {
	credentialId: string;
	value: string;
}): Promise<{ credentialId: string; value: string }[]> => {
	const decryptedUrls = await decrypt_urls(urls);
	return decryptedUrls;
};
