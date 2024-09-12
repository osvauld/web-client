import {
	addCredential,
	fetchAllFolders,
	fetchFolderUsersForDataSync,
} from "../dashboard/apis";

import { sendMessage } from "./helper";

export const approvedCredentialSubmit = async ({
	folderId,
	...otherData
}): Promise<boolean> => {
	// console.log("approved credentials ready =>", Object.values(otherData));

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
	// console.log("usersTo share", usersToShare);
	try {
		const operationCompletionStatus = await Promise.all(
			Object.values(otherData).map(
				async ({ username, password, url, description, name }) => {
					try {
						// const result = await postLoginCredentialHandler(individualCredential);

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
								fieldValue: url,
								fieldType: "additional",
							},
							{ fieldName: "URL", fieldValue: url, fieldType: "meta" },
						];
						addCredentialPayload.folderId = folderId;
						console.log(
							"userFields && fieldPayload =>",
							usersToShare,
							fieldPayload,
						);
						const userFields = await sendMessage("addCredential", {
							users: usersToShare,
							addCredentialFields: fieldPayload,
						});
						addCredentialPayload.name = name;
						addCredentialPayload.description = description;
						addCredentialPayload.userFields = userFields;
						console.log("Final payload =>", addCredentialPayload);
						// const response =  await addCredential(addCredentialPayload);
						// return { success: true, response };
					} catch (error) {
						console.error("Error posting credential:", error);
						return { success: false, error };
					}
				},
			),
		);

		console.log("operationCompletionStatus", operationCompletionStatus);
		const allSuccessful = operationCompletionStatus.every(
			(status) => status.success,
		);

		return allSuccessful;
	} catch (error) {
		console.error("Error in approvedCredentialSubmit:", error);
		return false;
	}
};
