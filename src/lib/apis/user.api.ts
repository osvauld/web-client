import {
	FetchAllUsersResponse,
	FetchCredentialUsersResponse,
} from "../dtos/response.dto";
import {
	getTokenAndBaseUrl,
	sendMessage,
} from "../components/dashboard/helper";

export const fetchSignedUpUsers = async (): Promise<FetchAllUsersResponse> => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);

	return await fetch(`${baseUrl}/users/signed-up`, {
		method: "GET",
		headers,
	}).then((response) => response.json());
};

// TODO: types for request and response
export const createUser = async (payload: any) => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);
	headers.append("Content-Type", "application/json");
	const signatureResponse = await sendMessage("hashAndSign", {
		message: JSON.stringify(payload),
	});
	headers.append("Signature", signatureResponse.signature);
	const response = await fetch(`${baseUrl}/user/`, {
		method: "POST",
		headers,
		body: JSON.stringify(payload),
	}).then((response) => response.json());
	return response;
};

export const fetchCredentialUsers = async (
	credentialId: string,
): Promise<FetchCredentialUsersResponse> => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);

	return await fetch(`${baseUrl}/credential/${credentialId}/users`, {
		method: "GET",
		headers,
	}).then((response) => response.json());
};

export const removeUserFromFolder = async (
	folderId: string,
	userId: string,
) => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);
	const signatureResponse = await sendMessage(
		"hashAndSign",
		JSON.stringify({ userIds: [userId] }),
	);
	headers.append("Signature", signatureResponse.signature);
	return await fetch(`${baseUrl}/folder/${folderId}/remove-user-access`, {
		method: "POST",
		headers,
		body: JSON.stringify({ userIds: [userId] }),
	}).then((response) => response.json());
};

export const removeUserFromCredential = async (
	credentialId: string,
	userId: string,
) => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);
	const signatureResponse = await sendMessage("hashAndSign", {
		message: JSON.stringify({ userIds: [userId] }),
	});
	headers.append("Signature", signatureResponse.signature);

	return await fetch(
		`${baseUrl}/credential/${credentialId}/remove-user-access`,
		{
			method: "POST",
			headers,
			body: JSON.stringify({ userIds: [userId] }),
		},
	).then((response) => response.json());
};

export const deleteUser = async (userId: string) => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);

	return await fetch(`${baseUrl}/user/${userId}`, {
		method: "DELETE",
		headers,
	}).then((response) => response.json());
};

export const checkUserNameExists = async (username: string, name: string) => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);

	return await fetch(`${baseUrl}/user/name-availability`, {
		method: "POST",
		headers,
		body: JSON.stringify({ username, name }),
	}).then((response) => response.json());
};

export const getUser = async () => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);

	return await fetch(`${baseUrl}/user`, {
		method: "GET",
		headers,
	}).then((response) => response.json());
};

export const fetchAllUsers = async (): Promise<any> => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);

	return await fetch(`${baseUrl}/users/all`, {
		method: "GET",
		headers,
	}).then((response) => response.json());
};

export const addCliUser = async (data: any) => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);
	headers.append("Content-Type", "application/json");

	const response = await fetch(`${baseUrl}/user/cli-user`, {
		method: "POST",
		headers,
		body: JSON.stringify(data),
	}).then((response) => response.json());

	return response;
};

export const fetchCliUsers = async () => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);

	return await fetch(`${baseUrl}/user/cli-users`, {
		method: "GET",
		headers,
	}).then((response) => response.json());
};
