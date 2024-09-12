import { addCredential, fetchFolderUsersForDataSync } from "../dashboard/apis";

import {
	SafariCredential,
	FirefoxCredential,
	ChromeCredential,
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
				async ({ username, password, domain, description, name }) => {
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
