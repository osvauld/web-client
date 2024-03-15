import { baseUrl, } from "./temp";
import browser from "webextension-polyfill";
import { FetchAllUsersResponse, FetchCredentialUsersResponse } from "../dtos/response.dto";

export const fetchAllUsers = async (): Promise<FetchAllUsersResponse> => {
  const headers = new Headers();
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  headers.append("Authorization", `Bearer ${token}`);

  return await fetch(`${baseUrl}/users`, {
    method: "GET",
    headers,
  }).then(response => response.json());
};

// TODO: types for request and response
export const createUser = async (payload: any) => {
  const headers = new Headers();
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  const response = await fetch(`${baseUrl}/user/`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  }).then((response) => response.json());
  return response;
}

export const fetchCredentialUsers = async (credentialId: string): Promise<FetchCredentialUsersResponse> => {

  const headers = new Headers();
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  headers.append("Authorization", `Bearer ${token}`);

  return await fetch(`${baseUrl}/credential/${credentialId}/users`, {
    method: "GET",
    headers,
  }).then(response => response.json());
}


export const removeUserFromFolder = async (folderId: string, userId: string) => {
  const headers = new Headers();
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  headers.append("Authorization", `Bearer ${token}`);

  return await fetch(`${baseUrl}/folder/${folderId}/remove-user-access`, {
    method: "POST",
    headers,
    body: JSON.stringify({ userIds: [userId] }),
  }).then(response => response.json());
}

export const removeUserFromCredential = async (credentialId: string, userId: string) => {
  const headers = new Headers();
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  headers.append("Authorization", `Bearer ${token}`);

  return await fetch(`${baseUrl}/credential/${credentialId}/remove-user-access`, {
    method: "POST",
    headers,
    body: JSON.stringify({ userIds: [userId] }),
  }).then(response => response.json());
}