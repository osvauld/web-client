import {
	BaseResponse,
	FetchAllUserUrlsResponse,
	FetchCredentialsByFolderResponse,
	FetchCredentialsFieldsByFolderIdResponse,
	FetchCredentialsFieldsByIdsResponse,
	FetchCredsByIdsResponse,
	FetchSensitiveFieldsByCredenitalIdResponse,
} from "../dtos/response.dto";
import {
	AddCredentialPayload,
	ShareCredentialsWithUsersPayload,
} from "../dtos/request.dto";
import {
	getTokenAndBaseUrl,
	sendMessage,
} from "../components/dashboard/helper";

export const fetchCredentialsByFolder = async (
	folderId: string,
): Promise<FetchCredentialsByFolderResponse> => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);
	headers.append("Content-Type", "application/json");

	return fetch(`${baseUrl}/folder/${folderId}/credential`, {
		headers,
	}).then((response) => response.json());
};

export const fetchCredentialById = async (credentialId: string) => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);
	headers.append("Content-Type", "application/json");

	return fetch(`${baseUrl}/credential/${credentialId}`, {
		headers,
	}).then((response) => response.json());
};

export const addCredential = async (payload: AddCredentialPayload) => {
	const headers = new Headers();

	const signatureResponse = await sendMessage("hashAndSign", {
		message: JSON.stringify(payload),
	});
	headers.append("Signature", signatureResponse.signature);
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);
	headers.append("Content-Type", "application/json");

	const response = await fetch(`${baseUrl}/credential/`, {
		method: "POST",
		headers,
		body: JSON.stringify(payload),
	}).then((response) => response.json());

	return response;
};

export const updateCredential = async (
	payload: AddCredentialPayload,
	credentialId: string,
) => {
	const signatureResponse = await sendMessage("hashAndSign", {
		message: JSON.stringify(payload),
	});
	const headers = new Headers();
	headers.append("Signature", signatureResponse.signature);
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);
	headers.append("Content-Type", "application/json");

	const response = await fetch(`${baseUrl}/credential/${credentialId}`, {
		method: "PUT",
		headers,
		body: JSON.stringify(payload),
	}).then((response) => response.json());

	return response;
};

export const fetchCredentialsFieldsByFolderId = async (
	folderId: string,
): Promise<FetchCredentialsFieldsByFolderIdResponse> => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);
	headers.append("User-Agent", "Insomnia/2023.5.7");

	const response = await fetch(`${baseUrl}/credentials/fields/${folderId}`, {
		method: "GET",
		headers,
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
};

export const shareCredentialsWithUsers = async (
	shareCredential: ShareCredentialsWithUsersPayload,
): Promise<BaseResponse> => {
	const signatureResponse = await sendMessage("hashAndSign", {
		message: JSON.stringify(shareCredential),
	});
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);
	headers.append("Signature", signatureResponse.signature);
	headers.append("Content-Type", "application/json");

	const response = await fetch(`${baseUrl}/share-credentials/users`, {
		method: "POST",
		headers,
		body: JSON.stringify(shareCredential),
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
};

export const fetchCredentialsFieldsByIds = async (
	credentialIds: string[],
): Promise<FetchCredentialsFieldsByIdsResponse> => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);
	headers.append("Content-Type", "application/json");

	const response = await fetch(`${baseUrl}/credentials/fields/`, {
		method: "POST",
		headers,
		body: JSON.stringify({ credentialIds }),
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
};

export const fetchCredsByIds = async (
	credentialIds: string[],
): Promise<FetchCredsByIdsResponse> => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);

	const response = await fetch(`${baseUrl}/credentials/by-ids`, {
		method: "POST",
		headers,
		body: JSON.stringify({ credentialIds }),
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
};

export const fetchAllUserUrls = async (): Promise<FetchAllUserUrlsResponse> => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);

	const response = await fetch(`${baseUrl}/urls`, {
		method: "GET",
		headers,
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
};

export const fetchSensitiveFieldsByCredentialId = async (
	credentialId: string,
): Promise<FetchSensitiveFieldsByCredenitalIdResponse> => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);

	const response = await fetch(
		`${baseUrl}/credential/${credentialId}/sensitive`,
		{
			method: "GET",
			headers,
		},
	);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
};

export const getSearchFields = async () => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);

	const response = await fetch(`${baseUrl}/credentials/search`, {
		method: "GET",
		headers,
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
};

export const editUserPermissionForCredential = async (
	credentialId: string,
	userId: string,
	accessType: string,
) => {
	const signatureResponse = await sendMessage("hashAndSign", {
		message: JSON.stringify({ userId, accessType }),
	});
	const headers = new Headers();
	headers.append("Signature", signatureResponse.signature);
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);
	headers.append("Content-Type", "application/json");

	const response = await fetch(
		`${baseUrl}/credential/${credentialId}/edit-user-access`,
		{
			method: "POST",
			headers,
			body: JSON.stringify({ userId, accessType }),
		},
	).then((response) => response.json());

	return response;
};

export const editGroupPermissionForCredential = async (
	credentialId: string,
	groupId: string,
	accessType: string,
) => {
	const signatureResponse = await sendMessage("hashAndSign", {
		message: JSON.stringify({ groupId, accessType }),
	});
	const headers = new Headers();
	headers.append("Signature", signatureResponse.signature);
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);
	headers.append("Content-Type", "application/json");

	const response = await fetch(
		`${baseUrl}/credential/${credentialId}/edit-group-access`,
		{
			method: "POST",
			headers,
			body: JSON.stringify({ groupId, accessType }),
		},
	).then((response) => response.json());

	return response;
};

export const fetchCredentialUsersForDataSync = async (credentialId: string) => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);
	headers.append("Content-Type", "application/json");

	const response = await fetch(
		`${baseUrl}/credential/${credentialId}/users-data-sync`,
		{
			method: "GET",
			headers,
		},
	).then((response) => response.json());

	return response;
};

export const removeCredential = async (credentialId: string) => {
	const signatureResponse = await sendMessage("hashAndSign", {
		message: credentialId,
	});
	const headers = new Headers();
	headers.append("Signature", signatureResponse.signature);
	const { token, baseUrl } = await getTokenAndBaseUrl();
	headers.append("Authorization", `Bearer ${token}`);
	headers.append("Content-Type", "application/json");

	const response = await fetch(`${baseUrl}/credential/${credentialId}`, {
		method: "DELETE",
		headers,
	}).then((response) => response.json());

	return response;
};

export const shareCredentialsWithEnv = async (data: any) => {
	const headers = new Headers();
	const { token, baseUrl } = await getTokenAndBaseUrl();
	const signatureResponse = await sendMessage("hashAndSign", {
		message: JSON.stringify(data),
	});
	headers.append("Authorization", `Bearer ${token}`);
	headers.append("Content-Type", "application/json");
	headers.append("Signature", signatureResponse.signature);

	const response = await fetch(`${baseUrl}/share-credentials/environment`, {
		method: "POST",
		headers,
		body: JSON.stringify(data),
	}).then((response) => response.json());

	return response;
};
