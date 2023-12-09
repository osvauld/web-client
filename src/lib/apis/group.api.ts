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
