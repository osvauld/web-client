import { CredentialStoreData } from "./credentialStore";
import { sendMessage, getDomain } from "../../helper";

import {
	EncryptedEditField,
	EditedUserField,
	EnvField,
	NewFieldPayload,
} from "../../../../dtos/credential.dto";

import {
	updateCredential,
	getEnvsForCredential,
	getEnvFieldsByCredentialId,
} from "../../apis";

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
