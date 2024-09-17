import { fetchFolderUsersForDataSync } from "../dashboard/apis";

import {
	IntermediateCredential,
	Credential,
	ApprovedCredentialSubmitParams,
	Platform,
} from "../../dtos/import.dto";

import {
	transformSafariCredentials,
	transformBitwardenCredentials,
	transformChromeCredentials,
	transformKeepassCredentials,
	transformDashlaneCredentials,
	transformFirefoxCredentials,
	transformLastpassCredentials,
	transformNordpassCredentials,
	transformOnepasswordCredentials,
	transformProtonpassCredentials,
	transformRoboformCredentials,
	finalProcessing,
} from "./parserHelper";

import Papa from "papaparse";

export const parseCsvLogins = (
	file: File,
	platform: Platform,
): Promise<IntermediateCredential[]> => {
	return new Promise<IntermediateCredential[]>((resolve, reject) => {
		let parsedData: Credential[] = [];
		let intermediateData: IntermediateCredential[] = [];

		function manageParsedData() {
			//only logins are handled for now
			switch (platform) {
				case "Safari": {
					intermediateData = transformSafariCredentials(parsedData);
					return true;
				}
				case "Firefox": {
					intermediateData = transformFirefoxCredentials(parsedData);
					return true;
				}
				case "Chrome":
				case "Opera":
				case "Edge": {
					intermediateData = transformChromeCredentials(parsedData);
					return true;
				}
				case "Lastpass": {
					intermediateData = transformLastpassCredentials(parsedData);
					return true;
				}
				case "Bitwarden": {
					intermediateData = transformBitwardenCredentials(parsedData);
					return true;
				}

				case "Protonpass": {
					intermediateData = transformProtonpassCredentials(parsedData);
					return true;
				}

				case "Dashlane": {
					intermediateData = transformDashlaneCredentials(parsedData);
					return true;
				}

				case "Nordpass": {
					intermediateData = transformNordpassCredentials(parsedData);
					return true;
				}

				case "Keepass": {
					intermediateData = transformKeepassCredentials(parsedData);
					return true;
				}

				case "Roboform": {
					intermediateData = transformRoboformCredentials(parsedData);
					return true;
				}

				case "1password": {
					intermediateData = transformOnepasswordCredentials(parsedData);
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
	const response = await fetchFolderUsersForDataSync(folderId);
	const usersToShare = response.data;
	try {
		const operationCompletionStatus = await Promise.allSettled(
			Object.values(otherData).map((data) =>
				finalProcessing(folderId, usersToShare, data),
			),
		);

		const operationsCompletion = operationCompletionStatus.every(
			(result) => result.status === "fulfilled" && result.value.success,
		);

		return operationsCompletion;
	} catch (error) {
		console.error("Error in approvedCredentialSubmit:", error);
		return false;
	}
};
