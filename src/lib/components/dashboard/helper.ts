import browser from "webextension-polyfill";
import { SearchedCredential } from "../../dtos/credential.dto";
import { AddCredentialPayload, User } from "./dtos";
import {
	SafariCredential,
	FirefoxCredential,
	ChromeCredential,
	IntermediateCredential,
	Credential,
} from "../../dtos/import.dto";
import Papa from "papaparse";
type TypeToClassKey = "reader" | "manager";

export const setbackground = (type: TypeToClassKey): string => {
	const typeToClassMap: Record<TypeToClassKey, string> = {
		reader: "bg-osvauld-readerOrange text-osvauld-readerText",
		manager: "bg-osvauld-managerPurple text-osvauld-managerText",
	};

	return typeToClassMap[type] || "";
};

export const getTokenAndBaseUrl = async () => {
	const [token, baseUrl] = await Promise.all([
		browser.storage.local.get("token"),
		browser.storage.local.get("baseUrl"),
	]);
	return { token: token.token, baseUrl: baseUrl.baseUrl };
};

export const sendMessage = async (action: string, data: any = {}) => {
	try {
		const response = await browser.runtime.sendMessage({
			action,
			data,
		});
		return response;
	} catch (error) {
		console.error(
			"Error sending message:",
			error,
			"\ndata",
			data,
			"action\n",
			action,
		);
	}
};
export const searchObjects = (
	query: string,
	credentials: SearchedCredential[],
) => {
	const searchResults: SearchedCredential[] = [];

	for (const credential of credentials) {
		for (const prop in credential) {
			if (
				typeof credential[prop as keyof SearchedCredential] === "string" &&
				credential[prop as keyof SearchedCredential]
					.toLowerCase()
					.includes(query.toLowerCase())
			) {
				searchResults.push(credential);
				break;
			}
		}
	}

	return searchResults;
};

export const clickOutside = (node: any) => {
	const handleClick = (event: any) => {
		if (node && !node.contains(event.target) && !event.defaultPrevented) {
			node.dispatchEvent(new CustomEvent("clickedOutside", node));
		}
	};

	document.addEventListener("click", handleClick, true);

	return {
		destroy() {
			document.removeEventListener("click", handleClick, true);
		},
	};
};

export const generatePassword = (length: number) => {
	const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
	const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const numberChars = "0123456789";
	const symbolChars = "!@#$%^&*()_";

	const charSet = lowercaseChars + uppercaseChars + numberChars + symbolChars;
	const passwordArray = new Uint8Array(length); // For storing random bytes
	window.crypto.getRandomValues(passwordArray);
	let password = "";
	for (let i = 0; i < length; i++) {
		const randomIndex = passwordArray[i] % charSet.length;
		password += charSet[randomIndex];
	}
	return password;
};

type TransformedPayload = {
	name: string;
	description: string;
	folderId: string;
	credentialType: string;
	domain: string;
	fields: {
		fieldName?: string;
		fieldType?: string;
		fieldValues: {
			userId: string;
			fieldValue: string;
		}[];
	}[];
};

export const transformAddCredentialPayload = (
	payload: AddCredentialPayload,
): TransformedPayload => {
	const fieldsMap: {
		[key: string]: {
			fieldName?: string;
			fieldType?: string;
			fieldValues: { userId: string; fieldValue: string }[];
		};
	} = {};

	payload.userFields.forEach((userField) => {
		userField.fields.forEach((field) => {
			const key = field.fieldName;
			if (!fieldsMap[key]) {
				fieldsMap[key] = {
					fieldName: field.fieldName,
					fieldType: field.fieldType,
					fieldValues: [],
				};
			}
			fieldsMap[key].fieldValues.push({
				userId: userField.userId,
				fieldValue: field.fieldValue,
			});
		});
	});

	const transformedFields = Object.values(fieldsMap);

	return {
		name: payload.name,
		description: payload.description,
		folderId: payload.folderId,
		credentialType: payload.credentialType,
		domain: payload.domain,
		fields: transformedFields,
	};
};

export const getDomain = (urlString: string) => {
	let url;
	try {
		url = new URL(urlString);
	} catch (_) {
		throw new Error("Invalid URL");
	}
	const hostname = url.hostname;
	const parts = hostname.split(".");
	let domain;
	if (parts.length > 2) {
		domain = parts.slice(-2).join(".");
	} else {
		domain = hostname;
	}
	return domain;
};

// required response 	type AddCredentialPayload = {
// 		name: string;
// 		description: string;
// 		folderId: string;
// 		credentialType: string;
// 		userFields: UserEncryptedFields[];
// 		domain: string;
// }

// Type guard functions
function isSafariCredential(
	credential: Credential,
): credential is SafariCredential {
	return "Title" in credential && "URL" in credential;
}

function isFirefoxCredential(
	credential: Credential,
): credential is FirefoxCredential {
	return "url" in credential && "guid" in credential;
}

function isChromeCredential(
	credential: Credential,
): credential is ChromeCredential {
	return "name" in credential && "url" in credential && "note" in credential;
}

export const parseCsvLogins = (
	file: File,
	platform: "Safari" | "Firefox" | "Chrome",
): Promise<IntermediateCredential[]> => {
	return new Promise<IntermediateCredential[]>((resolve, reject) => {
		let parsedData: Credential[] = [];
		let intermediateData: IntermediateCredential[] = [];

		function manageParsedData() {
			switch (platform) {
				case "Safari": {
					intermediateData = parsedData
						.filter(isSafariCredential)
						.map((credential) => ({
							name: credential.Title,
							description: credential.Notes,
							domain: credential.URL,
							username: credential.Username,
							password: credential.Password,
						}));
					console.log(intermediateData);
					return true;
				}
				case "Firefox": {
					intermediateData = parsedData
						.filter(isFirefoxCredential)
						.map((credential) => ({
							name: `Login - ${new URL(credential.url).hostname}`,
							description: `Created on ${new Date(+credential.timeCreated)}`,
							domain: credential.url,
							username: credential.username,
							password: credential.password,
						}));
					console.log(intermediateData);
					return true;
				}
				case "Chrome": {
					intermediateData = parsedData
						.filter(isChromeCredential)
						.map((credential) => ({
							name: credential.name,
							description: credential.note,
							domain: credential.url,
							username: credential.username,
							password: credential.password,
						}));
					console.log(intermediateData);
					return true;
				}

				default: {
					console.warn(`Unsupported platform: ${platform}`);
					return intermediateData.length > 0;
				}
			}
		}

		Papa.parse(file, {
			complete: (results) => {
				parsedData = results.data as Credential[];
				if (manageParsedData()) {
					resolve(intermediateData);
				} else {
					reject(
						new Error("No valid credentials found or unsupported platform"),
					);
				}
			},
			header: true,
			skipEmptyLines: true,
			error: (error) => {
				console.error("Error parsing CSV:", error);
				reject(error);
			},
		});
	});
};
