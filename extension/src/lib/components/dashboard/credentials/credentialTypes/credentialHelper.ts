import { CredentialStoreData } from "./credentialStore";
import { sendMessage } from "../../helper";
import { AddCredentialPayload } from "../../dtos";

import { addCredential } from "../../apis";

export const addCredentialHandler = async (
	credentialData: CredentialStoreData,
	folderId: string,
) => {
	const { usersToShare, credentialFields, name, description, credentialType } =
		credentialData;

	let addCredentialPaylod: AddCredentialPayload = {
		name: name,
		description: description,
		folderId: folderId,
		credentialType,
		userFields: [],
		domain: "",
	};

	const response = await sendMessage("addCredential", {
		users: usersToShare,
		addCredentialFields: credentialFields,
	});

	addCredentialPaylod.userFields = response;
	await addCredential(addCredentialPaylod);
};
