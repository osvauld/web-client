import { baseUrl } from "./temp";
import browser from "webextension-polyfill";
import { folderStore } from "../store/folder.store";
import { User } from "../dtos/user.dto";
import { ShareFolderWithUsersPayload } from "../dtos/folder.dto";

export const fetchAllFolders = async () => {

  const tokenObj = await await browser.storage.local.get("token");
  const token = tokenObj.token;
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  const response = await fetch(`${baseUrl}/folders/`, options).then(
    (response) => response.json()
  );

  if (response.data) {
    folderStore.set(response.data);
  }
};
export const fetchFolderUsers = async (folderId: string): Promise<User[]> => {
  const headers = new Headers();
  const tokenObj = await await browser.storage.local.get("token");
  const token = tokenObj.token;
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  const response = await fetch(`${baseUrl}/folder/${folderId}/users`, {
    headers,
  }).then((response) => response.json());
  const users: User[] = response.data;
  return users;
};

export const createFolder = async (payload: any) => {
  const headers = new Headers();
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
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
  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
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
