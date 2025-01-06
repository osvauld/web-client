import {
	SafariCredential,
	FirefoxCredential,
	ChromeCredential,
	LastpassCredential,
	BitwardenCredential,
	ProtonCredential,
	DashlaneCredential,
	NordpassCredential,
	KeepassCredential,
	RoboformCredential,
	OnepasswordCredential,
	Credential,
	IntermediateCredential,
	CredentialData,
} from "../dtos/import.dto";

import { UsersForDataSync } from "../../lib/components/dashboard/dtos";

import { sendMessage } from "../../lib/components/dashboard/helper";

const extractUsername = (username: string, email: string): string => {
	return username || email;
};

const extractTOTPSecret = (uri: string): string | null => {
	const match = uri.match(/[?&]secret=([^&]+)/);
	return match ? match[1] : null;
};

export const isSafariCredential = (
	credential: Credential,
): credential is SafariCredential => {
	return "Title" in credential && "URL" in credential;
};

export const isFirefoxCredential = (
	credential: Credential,
): credential is FirefoxCredential => {
	return "url" in credential && "guid" in credential;
};

// Chrome, edge CSVs and Opera CSVs follow similar format

export const isDashlaneCredential = (
	credential: Credential,
): credential is DashlaneCredential => {
	return (
		"username" in credential && "url" in credential && "note" in credential
	);
};

export const isKeepassCredential = (
	credential: Credential,
): credential is KeepassCredential => {
	return (
		"Web Site" in credential &&
		"Login Name" in credential &&
		"Comments" in credential
	);
};

export const isRoboformCredential = (
	credential: Credential,
): credential is RoboformCredential => {
	return (
		"MatchUrl" in credential && "Pwd" in credential && "Login" in credential
	);
};

export const isNordpassCredential = (
	credential: Credential,
): credential is NordpassCredential => {
	return "name" in credential && "url" in credential && "note" in credential;
};

export const is1passwordCredential = (
	credential: Credential,
): credential is OnepasswordCredential => {
	return (
		"Title" in credential && "Url" in credential && "OTPAuth" in credential
	);
};

export const isChromeCredential = (
	credential: Credential,
): credential is ChromeCredential => {
	return "name" in credential && "url" in credential && "note" in credential;
};

export const isLastpassCredential = (
	credential: Credential,
): credential is LastpassCredential => {
	return "name" in credential && "url" in credential;
};

export const isBitwardenCredential = (
	credential: Credential,
): credential is BitwardenCredential => {
	return "login_username" in credential && "login_uri" in credential;
};

export const isProtonCredential = (
	credential: Credential,
): credential is ProtonCredential => {
	return "username" in credential && "email" in credential;
};

export const transformSafariCredentials = (parsedData: Credential[]) => {
	return parsedData.filter(isSafariCredential).map((credential) => ({
		name: credential.Title,
		description: credential.Notes,
		domain: credential.URL,
		username: credential.Username,
		password: credential.Password,
	}));
};

export const transformFirefoxCredentials = (parsedData: Credential[]) => {
	return parsedData.filter(isFirefoxCredential).map((credential) => ({
		name: `Login - ${new URL(credential.url).hostname}`,
		description: `Created on ${new Date(+credential.timeCreated)}`,
		domain: credential.url,
		username: credential.username,
		password: credential.password,
	}));
};

export const transformChromeCredentials = (parsedData: Credential[]) => {
	return parsedData.filter(isChromeCredential).map((credential) => ({
		name: credential.name,
		description: credential.note,
		domain: credential.url,
		username: credential.username,
		password: credential.password,
	}));
};

export const transformLastpassCredentials = (parsedData: Credential[]) => {
	return parsedData
		.filter(isLastpassCredential)
		.filter((credential) => credential.username && credential.password)
		.map((credential) => ({
			name: credential.name,
			description: credential.extra,
			domain: credential.url,
			username: credential.username,
			password: credential.password,
			totp: credential.totp,
		}));
};

export const transformBitwardenCredentials = (parsedData: Credential[]) => {
	return parsedData
		.filter(isBitwardenCredential)
		.filter((credential) => credential.type === "login")
		.map((credential) => ({
			name: credential.name,
			description: credential.notes,
			domain: credential.login_uri,
			username: credential.login_username,
			password: credential.login_password,
			totp: credential.login_totp,
		}));
};

export const transformProtonpassCredentials = (parsedData: Credential[]) => {
	return parsedData
		.filter(isProtonCredential)
		.filter((credential) => credential.type === "login")
		.map((credential) => {
			const extractedUsername = extractUsername(
				credential.username,
				credential.email,
			);

			const result: IntermediateCredential = {
				name: credential.name,
				description: credential.note,
				domain: credential.url,
				username: extractedUsername,
				password: credential.password,
			};

			if (extractedUsername === credential.username && credential.email) {
				result.email = credential.email;
			}

			if (credential.totp) {
				const parsedTotp = extractTOTPSecret(credential.totp);
				if (parsedTotp) {
					result.totp = parsedTotp;
				}
			}

			return result;
		});
};

export const transformDashlaneCredentials = (parsedData: Credential[]) => {
	return parsedData.filter(isDashlaneCredential).map((credential) => ({
		name: credential.title,
		description: credential.note,
		domain: credential.url,
		username: credential.username,
		password: credential.password,
		totp: credential.otpSecret,
	}));
};

export const transformNordpassCredentials = (parsedData: Credential[]) => {
	return parsedData
		.filter(isNordpassCredential)
		.filter((credential) => credential.type === "password")
		.map((credential) => ({
			name: credential.name,
			description: credential.note,
			domain: credential.url,
			username: credential.username,
			password: credential.password,
		}));
};

export const transformKeepassCredentials = (parsedData: Credential[]) => {
	return parsedData.filter(isKeepassCredential).map((credential) => ({
		name: `Login - ${new URL(credential["Web Site"]).hostname}`,
		description: credential.Comments,
		domain: credential["Web Site"],
		username: credential["Login Name"],
		password: credential.Password,
	}));
};

export const transformRoboformCredentials = (parsedData: Credential[]) => {
	return parsedData.filter(isRoboformCredential).map((credential) => ({
		name: credential.Name,
		description: credential.Note,
		domain: credential.Url,
		username: credential.Login,
		password: credential.Pwd,
	}));
};

export const transformOnepasswordCredentials = (parsedData: Credential[]) => {
	return parsedData.filter(is1passwordCredential).map((credential) => ({
		name: credential.Title,
		description: credential.Notes,
		domain: credential.Url,
		username: credential.Username,
		password: credential.Password,
		totp: credential.OTPAuth,
	}));
};

export const finalProcessing = async (
	folderId: string,
	usersToShare: UsersForDataSync[],
	credentialData: CredentialData,
) => {
	try {
		const fieldPayload: {
			fieldName: string;
			fieldValue: string;
			fieldType: string;
		}[] = [];

		let addCredentialPayload = {
			name: "",
			folderId: "",
			description: "",
			credentialType: "Login",
			userFields: [],
			domain: "",
		};

		if (credentialData.username) {
			fieldPayload.push({
				fieldName: "Username",
				fieldValue: credentialData.username,
				fieldType: "meta",
			});
		}

		if (credentialData.password) {
			fieldPayload.push({
				fieldName: "Password",
				fieldValue: credentialData.password,
				fieldType: "sensitive",
			});
		}

		if (credentialData.domain) {
			fieldPayload.push(
				{
					fieldName: "Domain",
					fieldValue: credentialData.domain,
					fieldType: "additional",
				},
				{
					fieldName: "URL",
					fieldValue: credentialData.domain,
					fieldType: "meta",
				},
			);
		}

		if (credentialData.totp) {
			fieldPayload.push({
				fieldName: "TOTP",
				fieldValue: credentialData.totp,
				fieldType: "totp",
			});
		}
		if (credentialData.email) {
			fieldPayload.push({
				fieldName: "Email",
				fieldValue: credentialData.email,
				fieldType: "sensitive",
			});
		}
		addCredentialPayload.folderId = folderId;
		const userFields = await sendMessage("addCredential", {
			users: usersToShare,
			addCredentialFields: fieldPayload,
		});

		if (credentialData.name) {
			addCredentialPayload.name = credentialData.name;
		}

		if (credentialData.description) {
			addCredentialPayload.description = credentialData.description;
		}

		addCredentialPayload.userFields = userFields;
		// const response = await addCredential(addCredentialPayload);
		return { success: true };
	} catch (error) {
		console.error("Error posting credential:", error);
		return { success: false, error };
	}
};
