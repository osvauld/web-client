import { groupStore } from "../store/group.store";
import { baseUrl, token } from "./temp";

export const fetchAllUserGroups = () => {
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

export const fetchGroupUsers = (id: string) => {
  return fetch(`${baseUrl}/group/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());
};

export const createGroup = async (payload: any) => {
  const headers = new Headers();
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
