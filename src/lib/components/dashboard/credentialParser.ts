import { addCredential, fetchFolderUsersForDataSync } from "../dashboard/apis";

import {
	SafariCredential,
	FirefoxCredential,
	ChromeCredential,
	LastpassCredential,
	BitwardenCredential,
	ProtonCredential,
	DashlaneCredential,
	NordpassCredential,
	IntermediateCredential,
	KeepassCredential,
	RoboformCredential,
	OnepasswordCredential,
	Credential,
	ApprovedCredentialSubmitParams,
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

// Chrome, edge CSVs and Opera CSVs follow similar format

function isDashlaneCredential(
	credential: Credential,
): credential is DashlaneCredential {
	return (
		"username" in credential && "url" in credential && "note" in credential
	);
}

function isKeepassCredential(
	credential: Credential,
): credential is KeepassCredential {
	return (
		"Web Site" in credential &&
		"Login Name" in credential &&
		"Comments" in credential
	);
}

function isRoboformCredential(
	credential: Credential,
): credential is RoboformCredential {
	return (
		"MatchUrl" in credential && "Pwd" in credential && "Login" in credential
	);
}

function isNordpassCredential(
	credential: Credential,
): credential is NordpassCredential {
	return "name" in credential && "url" in credential && "note" in credential;
}

function is1passwordCredential(
	credential: Credential,
): credential is OnepasswordCredential {
	return (
		"Title" in credential && "Url" in credential && "OTPAuth" in credential
	);
}

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

function isProtonCredential(
	credential: Credential,
): credential is ProtonCredential {
	return "username" in credential && "email" in credential;
}

function extractUsername(username: string, email: string): string {
	return username || email;
}

function extractTOTPSecret(uri: string): string | null {
	const match = uri.match(/[?&]secret=([^&]+)/);
	return match ? match[1] : null;
}

export const parseCsvLogins = (
	file: File,
	platform:
		| "Safari"
		| "Firefox"
		| "Chrome"
		| "Opera"
		| "Bitwarden"
		| "Protonpass"
		| "Edge"
		| "Dashlane"
		| "1password"
		| "Nordpass"
		| "Keepass"
		| "Lastpass"
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
				case "Chrome":
				case "Opera":
				case "Edge": {
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

				case "Protonpass": {
					intermediateData = parsedData
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

							if (
								extractedUsername === credential.username &&
								credential.email
							) {
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
					return true;
				}

				case "Dashlane": {
					intermediateData = parsedData
						.filter(isDashlaneCredential)
						.map((credential) => ({
							name: credential.title,
							description: credential.note,
							domain: credential.url,
							username: credential.username,
							password: credential.password,
							totp: credential.otpSecret,
						}));
					return true;
				}

				case "Nordpass": {
					intermediateData = parsedData
						.filter(isNordpassCredential)
						.filter((credential) => credential.type === "password")
						.map((credential) => ({
							name: credential.name,
							description: credential.note,
							domain: credential.url,
							username: credential.username,
							password: credential.password,
						}));
					return true;
				}

				case "Keepass": {
					intermediateData = parsedData
						.filter(isKeepassCredential)
						.map((credential) => ({
							name: `Login - ${new URL(credential["Web Site"]).hostname}`,
							description: credential.Comments,
							domain: credential["Web Site"],
							username: credential["Login Name"],
							password: credential.Password,
						}));
					return true;
				}

				case "Roboform": {
					intermediateData = parsedData
						.filter(isRoboformCredential)
						.map((credential) => ({
							name: credential.Name,
							description: credential.Note,
							domain: credential.Url,
							username: credential.Login,
							password: credential.Pwd,
						}));
					return true;
				}

				case "1password": {
					intermediateData = parsedData
						.filter(is1passwordCredential)
						.map((credential) => ({
							name: credential.Title,
							description: credential.Notes,
							domain: credential.Url,
							username: credential.Username,
							password: credential.Password,
							totp: credential.OTPAuth,
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
				async ({
					username,
					password,
					domain,
					description,
					name,
					totp,
					email,
				}) => {
					try {
						const fieldPayload: {
							fieldName: string;
							fieldValue: string;
							fieldType: string;
						}[] = [];

						if (username) {
							fieldPayload.push({
								fieldName: "Username",
								fieldValue: username,
								fieldType: "meta",
							});
						}

						if (password) {
							fieldPayload.push({
								fieldName: "Password",
								fieldValue: password,
								fieldType: "sensitive",
							});
						}

						if (domain) {
							fieldPayload.push(
								{
									fieldName: "Domain",
									fieldValue: domain,
									fieldType: "additional",
								},
								{ fieldName: "URL", fieldValue: domain, fieldType: "meta" },
							);
						}

						if (totp) {
							fieldPayload.push({
								fieldName: "TOTP",
								fieldValue: totp,
								fieldType: "totp",
							});
						}
						if (email) {
							fieldPayload.push({
								fieldName: "Email",
								fieldValue: email,
								fieldType: "sensitive",
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
