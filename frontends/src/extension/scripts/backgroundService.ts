// import browser from "webextension-polyfill";
// import { fetchCredsByIds } from "../lib/apis/credentials.api";
// import {
// 	Credential,
// 	CredentialFields,
// 	EncryptedEditField,
// 	Field,
// 	UserEncryptedFields,
// 	UsersForDataSync,
// 	CapturedCredentialData,
// } from "../lib/dtos/credential.dto";
// import init, {
// 	generate_and_encrypt_keys,
// 	decrypt_and_store_keys,
// 	sign_message,
// 	encrypt_new_credential,
// 	decrypt_credentials,
// 	decrypt_text,
// 	get_public_key,
// 	sign_and_hash_message,
// 	generate_keys_without_password,
// 	encrypt_field_value,
// 	export_certificate,
// 	decrypt_urls,
// 	create_share_creds_payload,
// 	import_certificate,
// 	change_password,
// } from "./wasm";
// import { StorageService } from "./storageHelper";

// type CredentialsForUsersPayload = {
// 	accessType?: string;
// 	userId: string;
// 	credentials: CredentialFields[];
// };

// export const initiateAuthHandler = async (
// 	passphrase: string,
// ): Promise<string> => {
// 	const certificate = await StorageService.getCertificate();
// 	const salt = await StorageService.getSalt();
// 	const startTime = performance.now();
// 	if (certificate && salt) {
// 		await decrypt_and_store_keys(certificate, salt, passphrase);
// 	} else {
// 		throw Error("failed to fetch certificate and salt from storage");
// 	}
// 	console.log(
// 		"Time taken to decrypt and store keys:",
// 		performance.now() - startTime,
// 	);
// 	return get_public_key();
// };

// export const signChallengeHandler = async (challenge: string) => {
// 	return sign_message(challenge);
// };

// export const savePassphraseHandler = async (
// 	passphrase: string,
// 	challenge: string,
// 	username: string,
// ) => {
// 	await init();
// 	const keyPair = await generate_and_encrypt_keys(passphrase, username);
// 	StorageService.setCertificate(keyPair.get("certificate"));
// 	StorageService.setSalt(keyPair.get("salt"));
// 	decrypt_and_store_keys(
// 		keyPair.get("certificate"),
// 		keyPair.get("salt"),
// 		passphrase,
// 	);

// 	const signature = sign_message(challenge);
// 	return {
// 		username,
// 		signature,
// 		deviceKey: keyPair.get("public_key"),
// 		encryptionKey: keyPair.get("public_key"),
// 	};
// };

// export const decryptCredentialFieldsHandler = async (
// 	credentials: Credential[],
// ) => {
// 	const response: Credential[] = await decrypt_credentials(credentials);
// 	return response;
// };

// export const addCredentialHandler = async (payload: {
// 	users: UsersForDataSync[];
// 	addCredentialFields: Field[];
// }): Promise<UserEncryptedFields[]> => {
// 	return await encrypt_new_credential(
// 		payload.users,
// 		payload.addCredentialFields,
// 	);
// };

// export const decryptFieldHandler = async (text: string): Promise<string> => {
// 	const decrypted = await decrypt_text(text);
// 	return decrypted;
// };

// export const createShareCredsPayload = async (
// 	creds: any,
// 	selectedUsers: any,
// ): Promise<CredentialsForUsersPayload[]> => {
// 	const users = selectedUsers.map((user: any) => {
// 		return {
// 			id: user.id,
// 			publicKey: user.publicKey,
// 			accessType: user.accessType,
// 		};
// 	});
// 	const input = {
// 		credentials: creds,
// 		selectedUsers: users,
// 	};

// 	return await create_share_creds_payload(input);
// };

// export const getCertificate = async (passphrase: string) => {
// 	const pvtKey = await StorageService.getCertificate();
// 	const salt = await StorageService.getSalt();
// 	if (pvtKey && salt) {
// 		const response = export_certificate(passphrase, pvtKey, salt);
// 		return response;
// 	}
// };

// export const changePassphrase = async ({
// 	oldPassword,
// 	newPassword,
// }: {
// 	oldPassword: string;
// 	newPassword: string;
// }) => {
// 	const pvtKey = await StorageService.getCertificate();
// 	const salt = await StorageService.getSalt();
// 	if (pvtKey && salt) {
// 		const certificate = change_password({
// 			enc_pvt_key: pvtKey,
// 			oldPassword,
// 			newPassword,
// 			salt,
// 		});
// 		await StorageService.setCertificate(certificate);
// 		return certificate;
// 	}
// };

// export const handlePvtKeyImport = async (
// 	certificate: string,
// 	passphrase: string,
// ) => {
// 	await init();

// 	const response = await import_certificate(certificate, passphrase);
// 	await StorageService.setCertificate(response.get("certificate"));
// 	await StorageService.setSalt(response.get("salt"));

// 	return;
// };

// export const credentialSubmitHandler = async (
// 	newCredential: CapturedCredentialData,
// 	credIds: string[],
// ) => {
// 	if (credIds.length > 0) {
// 		const responseJson = await fetchCredsByIds(credIds);
// 		const listedCredentials = responseJson.data;
// 		const decryptedData =
// 			await decryptCredentialFieldsHandler(listedCredentials);
// 		if (decryptedData) {
// 			for (const credential of decryptedData) {
// 				for (const field of credential.fields) {
// 					if (field.fieldName == "Username") {
// 						if (field.fieldValue == newCredential.username) {
// 							return null;
// 						}
// 					}
// 				}
// 			}
// 		}
// 	}

// 	return true;
// };
// export const getCurrentDomain = async () => {
// 	const queryOptions = { active: true, currentWindow: true };
// 	const tabs = await browser.tabs.query(queryOptions);
// 	const url = new URL(tabs[0].url!);
// 	return url; // Returns the domain of the current active tab
// };

// export const sign_hashed_message = async (message: string): Promise<string> => {
// 	const response = await sign_and_hash_message(message);
// 	return response;
// };

// export const generateCliKeys = async (username: string) => {
// 	const response = await generate_keys_without_password(username);
// 	const returnObj = Object.fromEntries(response);
// 	return returnObj;
// };

// export const encryptEditFields = async (data: {
// 	fieldValue: string;
// 	usersToShare: { id: string; publicKey: string }[];
// }): Promise<EncryptedEditField[]> => {
// 	const encryptedFields = await encrypt_field_value(
// 		data.fieldValue,
// 		data.usersToShare,
// 	);
// 	const encryptedFieldsObject = encryptedFields.map((field: any) =>
// 		Object.fromEntries(field),
// 	);
// 	return encryptedFieldsObject;
// };

// export const getDecryptedUrls = async (urls: {
// 	credentialId: string;
// 	value: string;
// }): Promise<{ credentialId: string; value: string }[]> => {
// 	const decryptedUrls = await decrypt_urls(urls);
// 	return decryptedUrls;
// };
