import { fetchFolderUsersForDataSync } from "../lib/components/dashboard/apis";
import { Field, UserEncryptedFields } from "../lib/dtos/credential.dto";
import { transformAddCredentialPayload } from "../lib/components/dashboard/helper";
import { sign_hashed_message } from "./backgroundService";

import { addCredentialHandler } from "./backgroundService";
import { getTokenAndBaseUrl } from "../lib/components/dashboard/helper";

interface AddCredentialPayload {
	name: string;
	folderId: string;
	description: string;
	credentialType: string;
	userFields: UserEncryptedFields[];
	domain: string;
}

export const addCredential = async (payload: AddCredentialPayload) => {
	const headers = new Headers();
	const transformedPayload = transformAddCredentialPayload(payload);
	const sign = await sign_hashed_message(JSON.stringify(transformedPayload));
	headers.append("Signature", sign);
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);
	headers.append("Content-Type", "application/json");

	const response = await fetch(`${baseUrl}/credential/`, {
		method: "POST",
		headers,
		body: JSON.stringify(transformedPayload),
	}).then((response) => response.json());

	return response;
};

export const postLoginCredentialHandler = async ({
	description,
	domain,
	folderId,
	password,
	title,
	username,
}) => {
	let addCredentialPayload: AddCredentialPayload = {
		name: title,
		folderId: folderId,
		description: description,
		credentialType: "Login",
		userFields: [],
		domain,
	};

	const response = await fetchFolderUsersForDataSync(folderId);
	const usersToShare = response.data;
	const fieldPayload: Field[] = [
		{ fieldName: "Username", fieldValue: username, fieldType: "meta" },
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
	const userFields: UserEncryptedFields[] = await addCredentialHandler({
		users: usersToShare,
		addCredentialFields: fieldPayload,
	});
	addCredentialPayload.userFields = userFields;
	const finalAddCredResp = await addCredential(addCredentialPayload);
	return finalAddCredResp;
};
