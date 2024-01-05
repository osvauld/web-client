import { groupStore } from "../store/group.store";
import { baseUrl, } from "./temp";
import { User } from "../dtos/user.dto";
import browser from "webextension-polyfill";

export const fetchAllUserGroups = async () => {

  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  fetch(`${baseUrl}/groups`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((responseJson) => {
      groupStore.set(responseJson.data);
    });
};

export const fetchGroupUsers = async (id: string): Promise<User[]> => {

  const tokenObj = await browser.storage.local.get("token");
  const token = tokenObj.token;
  const response = await fetch(`${baseUrl}/group/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());
  return response.data;
};

export const createGroup = async (payload: any) => {
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
