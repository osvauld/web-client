import {
	addCredential,
	fetchFolderUsersForDataSync,
} from "../lib/components/dashboard/apis";

import { addCredentialHandler } from "./backgroundService";

export const postLoginCredentialHandler = async ({
	description,
	domain,
	folderId,
	password,
	title,
	username,
}) => {
	// 	data:
	//  description: "Login for User — Ratatype"
	// domain: "www.ratatype.com"
	// folderId: "4be6e5ec-6c36-4359-b2d1-7320917c7691"
	// password: "HdpbBq_KD9mXp#_"
	// title: "User — Ratatype"
	// username: "hapow92529@fandsend.com"
	let addCredentialPayload = {
		name: title,
		folderId: folderId,
		description: description,
		credentialType: "Login",
		userFields: [],
		domain,
	};
	const response = await fetchFolderUsersForDataSync(folderId);
	const usersToShare = response.data;
	const fieldPayload = [
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
	const userFields = await addCredentialHandler({
		users: usersToShare,
		addCredentialFields: fieldPayload,
	});
	addCredentialPayload.userFields = userFields;
	const finalAddCredResp = await addCredential(addCredentialPayload);
	return finalAddCredResp;
};
