import { baseUrl, } from "./temp";
import browser from "webextension-polyfill";
import { FetchAllUserGroupsResponse, FetchGroupUsersResponse, FetchGroupsWithoutAccessResponse, fetchUsersByGroupIdsResponse, FetchUsersWithoutGroupAccess, FetchGroupCredentialResponse, FetchCredentialGroupsResponse } from "../dtos/response.dto";
import { AddUserToGroupPayload, CreateGroupPayload, ShareCredentialsWithGroupsPayload } from "../dtos/request.dto";

export const fetchAllUserGroups = async (): Promise<FetchAllUserGroupsResponse> => {
  // TODO: change store setting from here.
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  return fetch(`${baseUrl}/groups`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
};

export const fetchGroupUsers = async (id: string): Promise<FetchGroupUsersResponse> => {

  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  return await fetch(`${baseUrl}/group/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());

};

export const createGroup = async (payload: CreateGroupPayload) => {
  const headers = new Headers();
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  const response = await fetch(`${baseUrl}/group`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// TODO: add type for payload
export const addUserToGroup = async (payload: AddUserToGroupPayload) => {
  const headers = new Headers();
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  const response = await fetch(`${baseUrl}/group/members`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}


export const fetchUsersByGroupIds = async (ids: string[]): Promise<fetchUsersByGroupIdsResponse> => {
  const headers = new Headers();
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");
  const responseJson = fetch(`${baseUrl}/groups/members`, {
    method: "POST",
    headers,
    body: JSON.stringify({ groupIds: ids }),
  }).then((response) => response.json());
  return responseJson;
}

export const shareCredentialsWithGroups = async (payload: ShareCredentialsWithGroupsPayload) => {
  const headers = new Headers();
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  const response = await fetch(`${baseUrl}/share-credentials/groups`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const fetchGroupsWithoutAccess = async (folderId: string): Promise<FetchGroupsWithoutAccessResponse> => {
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  return await fetch(`${baseUrl}/groups/without-access/${folderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());

}

export const fetchCredentialFieldsByGroupId = async (groupId: string): Promise<FetchGroupCredentialResponse> => {
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  return await fetch(`${baseUrl}/group/${groupId}/credential-fields`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());
}

export const fetchUsersWithoutGroupAccess = async (groupId: string): Promise<FetchUsersWithoutGroupAccess> => {
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  return await fetch(`${baseUrl}/groups/${groupId}/users/without-access`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());
}

export const fetchCredentialGroups = async (credentialId: string): Promise<FetchCredentialGroupsResponse> => {

  const headers = new Headers();
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  headers.append("Authorization", `Bearer ${token}`);

  return await fetch(`${baseUrl}/credential/${credentialId}/groups`, {
    method: "GET",
    headers,
  }).then(response => response.json());
}
