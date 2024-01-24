import browser from "webextension-polyfill";
import { baseUrl, } from "./temp";
import { ShareCredentialsWithUsersPayload } from "../dtos/credential.dto";

export const fetchCredentialsByFolder = async (folderId: string) => {
  const headers = new Headers();
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  return fetch(`${baseUrl}/folder/${folderId}/credential`, {
    headers,
  }).then((response) => response.json());
};

export const fetchCredentialById = async (credentialId: string) => {
  const headers = new Headers();
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  return fetch(`${baseUrl}/credential/${credentialId}`, {
    headers,
  }).then((response) => response.json());
};

export const addCredential = async (payload: any) => {
  const headers = new Headers();
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  const response = await fetch(`${baseUrl}/credential/`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  }).then((response) => response.json());

  return response;
};

export const fetchCredentialsFieldsByFolderId = async (folderId: string) => {
  const headers = new Headers();
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
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

export const shareCredentialsWithUsers = async (shareCredential: ShareCredentialsWithUsersPayload) => {
  const headers = new Headers();
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  headers.append("Authorization", `Bearer ${token}`);
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

export const fetchCredentialsFieldsByIds = async (credentialIds: string[]) => {
  const headers = new Headers();
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
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

export const fetchCredsByIds = async (credentialIds: string[]) => {
  const headers = new Headers();
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
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
}

export const fetchAllUserUrls = async () => {
  const headers = new Headers();
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  headers.append("Authorization", `Bearer ${token}`);

  const response = await fetch(`${baseUrl}/urls`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const fetchSensitiveFieldsByCredentialId = async (credentialId: string) => {
  const headers = new Headers();
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  headers.append("Authorization", `Bearer ${token}`);

  const response = await fetch(`${baseUrl}/credential/${credentialId}/sensitive`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}