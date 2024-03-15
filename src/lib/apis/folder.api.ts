import { ShareFolderWithUsersPayload, ShareFolderWithGroupsPayload } from "../dtos/request.dto";
import { FolderGroupResponse, FolderUserResponse, BaseResponse, FetchAllFoldersResponse } from "../dtos/response.dto";
import { getTokenAndBaseUrl } from "../components/dashboard/helper";

export const fetchAllFolders = async (): Promise<FetchAllFoldersResponse> => {

  const { token, baseUrl } = await getTokenAndBaseUrl()
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  return fetch(`${baseUrl}/folders/`, options).then(
    (response) => response.json()
  );
};

export const fetchFolderUsers = async (folderId: string): Promise<FolderUserResponse> => {
  const headers = new Headers();
  const { token, baseUrl } = await getTokenAndBaseUrl()
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  return fetch(`${baseUrl}/folder/${folderId}/users`, {
    headers,
  }).then((response) => response.json());
};

export const fetchFolderGroups = async (folderId: string): Promise<FolderGroupResponse> => {
  const headers = new Headers();
  const { token, baseUrl } = await getTokenAndBaseUrl()
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  return await fetch(`${baseUrl}/folder/${folderId}/groups`, {
    headers,
  }).then((response) => response.json());
};

export const createFolder = async (payload: any): Promise<BaseResponse> => {
  const headers = new Headers();
  const { token, baseUrl } = await getTokenAndBaseUrl()
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  const response = await fetch(`${baseUrl}/folder/`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const shareFolderWithUsers = async (payload: ShareFolderWithUsersPayload) => {
  const headers = new Headers();
  const { token, baseUrl } = await getTokenAndBaseUrl()
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  const response = await fetch(`${baseUrl}/share-folder/users`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const shareFolderWithGroups = async (payload: ShareFolderWithGroupsPayload) => {
  const headers = new Headers();
  const { token, baseUrl } = await getTokenAndBaseUrl()
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  const response = await fetch(`${baseUrl}/share-folder/groups`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
