import {
	CredentialFieldComponentProps,
	UpdateCredentialPayload,
	AddCredentialPayload,
} from "../../dtos";
import { getDomain } from "../../helper";

export const fieldEditHandler = (
	field: CredentialFieldComponentProps,
	credentialFields,
	edit,
) => {
	let changedFields = new Set();
	console.log(field, credentialFields);
	// if (edit && field.fieldId) {
	// 	changedFields.add(field.fieldId);
	// 	if (field.fieldName === "URL") {
	// 		for (const fieldData of credentialFields) {
	// 			if (fieldData.fieldName === "Domain") {
	// 				changedFields.add(fieldData.fieldId);
	// 				const updatedDomain = getDomain(field.fieldValue);
	// 				fieldData.fieldValue = updatedDomain;
	// 			}
	// 		}
	// 	}
	// }
	// return changedFields;
};

export const isUpdateCredentialPayload = (
	data: any,
): data is UpdateCredentialPayload => {
	return "credentialId" in data;
};

export const isAddCredentialPayload = (
	data: any,
): data is AddCredentialPayload => {
	return !("credentialId" in data);
};

export const credentialFieldsUpdater = (type: string) => {
	switch (type) {
		case "Login":
			return [
				{ fieldName: "Osvauld Name", fieldValue: "", sensitive: false },
				{ fieldName: "Username", fieldValue: "", sensitive: false },
				{ fieldName: "Password", fieldValue: "", sensitive: true },
				{ fieldName: "URL", fieldValue: "https://", sensitive: false },
				{ fieldName: "TOTP", fieldValue: "", sensitive: true },
				{ fieldName: "Description", fieldValue: "", sensitive: false },
			];
		case "Credit/DebitCard":
			return [
				{ fieldName: "Osvauld Name", fieldValue: "", sensitive: false },
				{ fieldName: "Name", fieldValue: "", sensitive: false },
				{ fieldName: "Card Number", fieldValue: "", sensitive: true },
				{ fieldName: "Expiration Date", fieldValue: "", sensitive: false },
				{ fieldName: "CVV", fieldValue: "", sensitive: true },
				{ fieldName: "Type", fieldValue: "", sensitive: false },
				{ fieldName: "Bank/Issuer", fieldValue: "", sensitive: false },
				{ fieldName: "Description", fieldValue: "", sensitive: false },
			];
		case "Contact":
			return [
				{ fieldName: "Osvauld Name", fieldValue: "", sensitive: false },
				{ fieldName: "Name", fieldValue: "", sensitive: false },
				{ fieldName: "Email", fieldValue: "", sensitive: false },
				{ fieldName: "Phone", fieldValue: "", sensitive: false },
				{ fieldName: "Address", fieldValue: "", sensitive: false },
				{ fieldName: "Description", fieldValue: "", sensitive: false },
			];
		case "Digital Wallet":
			return [
				{ fieldName: "Osvauld Name", fieldValue: "", sensitive: false },
				{ fieldName: "Wallet Name", fieldValue: "", sensitive: false },
				{ fieldName: "Wallet Address", fieldValue: "", sensitive: true },
				{ fieldName: "Private Key", fieldValue: "", sensitive: true },
				{ fieldName: "Description", fieldValue: "", sensitive: false },
			];
		case "SSH Key":
			return [
				{ fieldName: "Osvauld Name", fieldValue: "", sensitive: false },
				{ fieldName: "Key Name", fieldValue: "", sensitive: false },
				{ fieldName: "Public Key", fieldValue: "", sensitive: false },
				{ fieldName: "Private Key", fieldValue: "", sensitive: true },
				{ fieldName: "Passphrase", fieldValue: "", sensitive: true },
				{ fieldName: "Description", fieldValue: "", sensitive: false },
			];
		case "Database":
			return [
				{ fieldName: "Osvauld Name", fieldValue: "", sensitive: false },
				{ fieldName: "Database Name", fieldValue: "", sensitive: false },
				{ fieldName: "Host", fieldValue: "", sensitive: false },
				{ fieldName: "Port", fieldValue: "", sensitive: false },
				{ fieldName: "Username", fieldValue: "", sensitive: false },
				{ fieldName: "Password", fieldValue: "", sensitive: true },
				{ fieldName: "Description", fieldValue: "", sensitive: false },
			];
		case "PIN":
			return [
				{ fieldName: "Osvauld Name", fieldValue: "", sensitive: false },
				{ fieldName: "PIN Name", fieldValue: "", sensitive: false },
				{ fieldName: "PIN", fieldValue: "", sensitive: true },
				{ fieldName: "Description", fieldValue: "", sensitive: false },
			];
		case "Note":
			return [
				{ fieldName: "Osvauld Name", fieldValue: "", sensitive: false },
				{ fieldName: "Note1", fieldValue: "", sensitive: false },
				{ fieldName: "Description", fieldValue: "", sensitive: false },
			];
		case "Bank Account":
			return [
				{ fieldName: "Osvauld Name", fieldValue: "", sensitive: false },
				{ fieldName: "Account Holder", fieldValue: "", sensitive: false },
				{ fieldName: "Account Number", fieldValue: "", sensitive: true },
				{ fieldName: "Routing Number", fieldValue: "", sensitive: true },
				{ fieldName: "Bank Name", fieldValue: "", sensitive: false },
				{ fieldName: "Account Type", fieldValue: "", sensitive: false },
				{ fieldName: "Description", fieldValue: "", sensitive: false },
			];
		case "Social Media":
			return [
				{ fieldName: "Osvauld Name", fieldValue: "", sensitive: false },
				{ fieldName: "Platform", fieldValue: "", sensitive: false },
				{ fieldName: "Username", fieldValue: "", sensitive: false },
				{ fieldName: "Password", fieldValue: "", sensitive: true },
				{ fieldName: "Profile URL", fieldValue: "", sensitive: false },
				{ fieldName: "Description", fieldValue: "", sensitive: false },
			];
		case "API Key":
			return [
				{ fieldName: "Osvauld Name", fieldValue: "naaammm", sensitive: false },
				{ fieldName: "API Name", fieldValue: "", sensitive: false },
				{ fieldName: "API Key", fieldValue: "", sensitive: true },
				{ fieldName: "API Secret", fieldValue: "", sensitive: true },
				{ fieldName: "Endpoint", fieldValue: "", sensitive: false },
				{ fieldName: "Description", fieldValue: "hellow", sensitive: false },
			];
		default:
			return [];
	}
};
