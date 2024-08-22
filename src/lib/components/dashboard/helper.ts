import browser from "webextension-polyfill";
import { SearchedCredential } from "../../dtos/credential.dto";
import { AddCredentialPayload, User } from "./dtos";
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
