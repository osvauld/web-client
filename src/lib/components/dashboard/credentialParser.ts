import { addCredential, fetchFolderUsersForDataSync } from "../dashboard/apis";

import {
	SafariCredential,
	FirefoxCredential,
	ChromeCredential,
	LastpassCredential,
	BitwardenCredential,
	IntermediateCredential,
	Credential,
} from "../../dtos/import.dto";

import Papa from "papaparse";

import { sendMessage } from "./helper";

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

// Chrome CSVs and Opera CSVs follow similar format

function isChromeCredential(
	credential: Credential,
): credential is ChromeCredential {
	return "name" in credential && "url" in credential && "note" in credential;
}

function isLastpassCredential(
	credential: Credential,
): credential is LastpassCredential {
	return "name" in credential && "url" in credential;
}

function isBitwardenCredential(
	credential: Credential,
): credential is BitwardenCredential {
	return "login_username" in credential && "login_uri" in credential;
}

export const parseCsvLogins = (
	file: File,
	platform:
		| "Safari"
		| "Firefox"
		| "Chrome"
		| "Opera"
		| "Bitwarden"
		| "Edge"
		| "Dashlane"
		| "1password"
		| "Nordpass"
		| "Passbolt"
		| "Keepass"
		| "Lastpass"
		| "Kaspersky"
		| "Roboform",
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
					return true;
				}
				case "Chrome" || "Opera": {
					intermediateData = parsedData
						.filter(isChromeCredential)
						.map((credential) => ({
							name: credential.name,
							description: credential.note,
							domain: credential.url,
							username: credential.username,
							password: credential.password,
						}));
					return true;
				}
				case "Lastpass": {
					//only logins are handled for now
					intermediateData = parsedData
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
					return true;
				}
				case "Bitwarden": {
					//only logins are handled for now
					intermediateData = parsedData
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

type CredentialData = {
	username: string;
	password: string;
	domain: string;
	description: string;
	name: string;
	totp: string;
};

type ApprovedCredentialSubmitParams = {
	folderId: string;
} & {
	[key: string]: CredentialData;
};

export const approvedCredentialSubmit = async ({
	folderId,
	...otherData
}: ApprovedCredentialSubmitParams): Promise<boolean> => {
	let addCredentialPayload = {
		name: "",
		folderId: "",
		description: "",
		credentialType: "Login",
		userFields: [],
		domain: "",
	};

	const response = await fetchFolderUsersForDataSync(folderId);
	const usersToShare = response.data;
	try {
		const operationCompletionStatus = await Promise.all(
			Object.values(otherData).map(
				async ({ username, password, domain, description, name, totp }) => {
					try {
						const fieldPayload = [
							{
								fieldName: "Username",
								fieldValue: username,
								fieldType: "meta",
							},
							{
								fieldName: "Password",
								fieldValue: password,
								fieldType: "sensitive",
							},
							{
								fieldName: "Domain",
								fieldValue: domain,
								fieldType: "additional",
							},
							{ fieldName: "URL", fieldValue: domain, fieldType: "meta" },
						];

						if (totp) {
							fieldPayload.push({
								fieldName: "TOTP",
								fieldValue: totp,
								fieldType: "totp",
							});
						}
						addCredentialPayload.folderId = folderId;
						const userFields = await sendMessage("addCredential", {
							users: usersToShare,
							addCredentialFields: fieldPayload,
						});
						addCredentialPayload.name = name;
						addCredentialPayload.description = description;
						addCredentialPayload.userFields = userFields;
						const response = await addCredential(addCredentialPayload);
						return { success: true, response };
					} catch (error) {
						console.error("Error posting credential:", error);
						return { success: false, error };
					}
				},
			),
		);

		const allSuccessful = operationCompletionStatus.every(
			(status) => status.success,
		);

		return allSuccessful;
	} catch (error) {
		console.error("Error in approvedCredentialSubmit:", error);
		return false;
	}
};
