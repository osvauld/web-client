import { baseUrl, token } from "./temp";
import { secretsStore } from "../store/secret.store";
export const fetchSecretsByFolder = async (folderId: string) => {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  const response = await fetch(`${baseUrl}/folder/${folderId}/credentail`, {
    headers,
  }).then((response) => response.json());

  if (response.data) {
    secretsStore.set(response.data);
  }
};
