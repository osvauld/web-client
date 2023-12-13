import { baseUrl, token } from "./temp";

export const fetchAllUsers = async () => {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);

  const response = await fetch(`${baseUrl}/users`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
