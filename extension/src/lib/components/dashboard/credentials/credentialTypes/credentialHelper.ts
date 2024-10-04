import { CredentialStoreData } from "./credentialStore";
import { sendMessage, getDomain } from "../../helper";
import {
	AddCredentialPayload,
	CredentialFieldComponentProps,
	Field,
} from "../../dtos";

import { EncryptedEditField } from "../../../../dtos/credential.dto";

import {
	addCredential,
	updateCredential,
	getEnvsForCredential,
	getEnvFieldsByCredentialId,
} from "../../apis";

// Please note that remove field hadn't added here yet.

// const removeField = (index: number) => {
//     const field = credentialFields[index];
//     if (field && field.fieldId) {
//         const fieldId = field.fieldId;
//         if (typeof fieldId === "string") {
//             deletedFields.push(fieldId);
//         }
//     }
//     credentialFields.splice(index, 1);
//     credentialFields = [...credentialFields];
// };

const totpValidator = (secretKey: string): boolean => {
	// Base32 encoded TOTP secrets typically range in size, allowing for flexibility
	if (secretKey.length < 10 || secretKey.length > 64) {
		return false;
	}

	// Check character set: Only uppercase letters A-Z and digits 2-7 are valid
	const validBase32Regex = /^[A-Z2-7]+$/;
	if (!validBase32Regex.test(secretKey)) {
		return false;
	}

	return true;
};

const fieldValidator = (credentialFields: any) => {
	let totpPresence = credentialFields.find(
		(field: CredentialFieldComponentProps) => {
			if (field.fieldName === "TOTP" && field.fieldValue.length !== 0) {
				return field;
			}
		},
	);

	let isValidUrl = !credentialFields.some(
		(field: CredentialFieldComponentProps) => {
			if (field.fieldName === "URL") {
				try {
					getDomain(field.fieldValue);
					return false;
				} catch (_) {
					return true;
				}
			}
			return false;
		},
	);

	if (totpPresence) {
		const isTotpValid = totpValidator(totpPresence.fieldValue);
		if (!isTotpValid) {
			// Need to communicate with the UI that TOTP is invalid

			// isLoaderActive = false;
			// invalidTotp = true;
			// setTimeout(() => {
			// 	invalidTotp = false;
			// }, 1000);
			return {
				success: false,
				message: "TOTP entered is Invalid!",
			};
		}
	}
	if (!isValidUrl) {
		// Need to convey in the UI taht the url is invalid

		// isLoaderActive = false;
		// invalidUrl = true;
		// setTimeout(() => {
		// 	invalidUrl = false;
		// }, 1000);
		return {
			success: false,
			message: "Invalid URL",
		};
	}

	return {
		success: true,
		message: "Successful Validation",
	};
};

export const updateCredentialHandler = async (
	credentialData: CredentialStoreData,
	credentialId: string | undefined,
) => {
	const { usersToShare, credentialFields, name, description, credentialType } =
		credentialData;
	if (!credentialId)
		return {
			success: false,
			message: "No credential Id Found",
		};
	const changedFields = new Set();

	// Need to update deleted fields here
	const deletedFields: string[] = [];

	type EditedUserField = {
		fieldId: string;
		fieldName: string;
		fieldType: string;
		fieldValues: EncryptedEditField[];
	};

	type EnvField = {
		envFieldId: string;
		fieldValue: string;
	};

	type NewFieldPayload = {
		fieldName: string;
		fieldType: string;
		fieldValues: {
			fieldValue: string;
			userId: string;
			envFieldValues: { envId: string; fieldValue: string }[];
		}[];
	};

	const editedUserFields: EditedUserField[] = [];
	const editedEnvFields: EnvField[] = [];
	const newFields: NewFieldPayload[] = [];
	const envResponse = await getEnvsForCredential(credentialId);
	const users = usersToShare.map((user) => ({
		id: user.id,
		publicKey: user.publicKey,
	}));
	const envFieldsResponse = await getEnvFieldsByCredentialId(credentialId);
	let userEnvMap = envResponse.data.reduce((obj: any, item) => {
		if (!obj[item.cliUserCreatedBy]) {
			obj[item.cliUserCreatedBy] = [];
		}
		obj[item.cliUserCreatedBy].push(item);
		return obj;
	}, {});
	let domain = "";
	const envFieldMap = envFieldsResponse.data;
	for (const field of credentialFields) {
		if (field.fieldName === "URL") {
			domain = getDomain(field.fieldValue);
		}
		let editedUserField: EditedUserField;
		if (field.fieldId && changedFields.has(field.fieldId)) {
			editedUserField = {
				fieldId: field.fieldId,
				fieldName: field.fieldName,
				fieldType:
					field.fieldName === "TOTP"
						? "totp"
						: field.sensitive
							? "sensitive"
							: "meta",
				fieldValues: [],
			};
			if (field?.fieldId && envFieldMap[field.fieldId]) {
				// making envFieldId as userId to reuse 'encryptEditFields' case
				const envFieldPayloadForEncryption = envFieldMap[field.fieldId].map(
					(envField) => {
						return {
							id: envField.envFieldId,
							publicKey: envField.cliUserPublicKey,
						};
					},
				);
				const encryptedEditFields: EncryptedEditField[] = await sendMessage(
					"encryptEditFields",
					{
						fieldValue: field.fieldValue,
						usersToShare: envFieldPayloadForEncryption,
					},
				);
				const envFieldPayload = encryptedEditFields.map((envField) => {
					return {
						envFieldId: envField.userId,
						fieldValue: envField.fieldValue,
					};
				});
				editedEnvFields.push(...envFieldPayload);
			}
			const encryptedEditFields: EncryptedEditField[] = await sendMessage(
				"encryptEditFields",
				{
					fieldValue: field.fieldValue,
					usersToShare: users,
				},
			);
			editedUserField.fieldValues = encryptedEditFields;
			editedUserFields.push(editedUserField);
		} else if (!field.fieldId) {
			const newFieldPayload: NewFieldPayload = {
				fieldName: field.fieldName,
				fieldType:
					field.fieldName === "TOTP"
						? "totp"
						: field.sensitive
							? "sensitive"
							: "meta",
				fieldValues: [],
			};

			const encryptedEditFields: EncryptedEditField[] = await sendMessage(
				"encryptEditFields",
				{
					fieldValue: field.fieldValue,
					usersToShare: users,
				},
			);
			for (const fieldData of encryptedEditFields) {
				let payload: {
					fieldValue: string;
					userId: string;
					envFieldValues: { envId: string; fieldValue: string }[];
				} = {
					fieldValue: fieldData.fieldValue,
					userId: fieldData.userId,
					envFieldValues: [],
				};

				if (userEnvMap[fieldData.userId]) {
					const cliUsersToShare = userEnvMap[fieldData.userId].map(
						(envData: any) => {
							return {
								id: envData.envId,
								publicKey: envData.cliUserPublicKey,
							};
						},
					);
					const encryptedFields: EncryptedEditField[] = await sendMessage(
						"encryptEditFields",
						{
							fieldValue: field.fieldValue,
							usersToShare: cliUsersToShare,
						},
					);
					const envFieldsValues = encryptedFields.map((envField) => {
						return {
							envId: envField.userId,
							fieldValue: envField.fieldValue,
						};
					});
					payload.envFieldValues = envFieldsValues;
				}
				newFieldPayload.fieldValues.push(payload);
			}
			newFields.push(newFieldPayload);
		}
	}
	const payload = {
		name,
		description,
		credentialId,
		credentialType,
		editedUserFields,
		editedEnvFields,
		newFields,
		domain: "",
		deletedFields,
	};
	const updatecredResponse = await updateCredential(payload, credentialId);
	return {
		success: updatecredResponse.status === 200,
		message:
			updatecredResponse.status === 200
				? "updating credential successful"
				: "Failed to add credential",
	};
};

export const addCredentialHandler = async (
	credentialData: CredentialStoreData,
	folderId: string,
) => {
	const { usersToShare, credentialFields, name, description, credentialType } =
		credentialData;

	const fieldValidationResponse: { success: boolean; message: string } =
		fieldValidator(credentialFields);

	if (fieldValidationResponse.success) return fieldValidationResponse;

	let addCredentialFields: Field[] = [];

	for (const field of credentialFields) {
		if (field.fieldName === "URL" && field.fieldValue.length !== 0) {
			try {
				if (
					!field.fieldValue.startsWith("https://") &&
					!field.fieldValue.startsWith("http://")
				) {
					return {
						success: false,
						message: "Invalid URL",
					};
				}
				const domain = getDomain(field.fieldValue);
				addCredentialFields.push({
					fieldName: "Domain",
					fieldValue: domain,
					fieldType: "additional",
				});
			} catch (error) {
				return {
					success: false,
					message: "Invalid URL",
				};
			}
		}
		if (
			(field.fieldName.length !== 0 || field.fieldValue.length !== 0) &&
			field.fieldName !== "Domain"
		) {
			const baseField: Field = {
				fieldName: field.fieldName,
				fieldValue: field.fieldValue,
				fieldType: field.sensitive ? "sensitive" : "meta",
			};
			if (field.fieldName === "TOTP") {
				if (field.fieldValue.length !== 0) {
					baseField.fieldType = "totp";
					addCredentialFields.push(baseField);
				} else {
					continue;
				}
			} else {
				addCredentialFields.push(baseField);
			}
		}
	}

	const addCredentialPaylod: AddCredentialPayload = {
		name: name,
		description: description,
		folderId: folderId,
		credentialType,
		userFields: [],
		domain: "",
	};

	const response = await sendMessage("addCredential", {
		users: usersToShare,
		addCredentialFields,
	});

	addCredentialPaylod.userFields = response;
	const addCredResponse = await addCredential(addCredentialPaylod);
	console.log("Checking add credential response", addCredResponse);
	return {
		success: addCredResponse.status === 200,
		message:
			addCredResponse.status === 200
				? "Adding credential successful"
				: "Failed to add credential",
	};
};
