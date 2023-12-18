import { baseUrl, token } from "./temp";
import { User } from "../dtos/user.dto";

export const fetchAllUsers = async (): Promise<User[]> => {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);

  const response = await fetch(`${baseUrl}/users`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const responseJson = await response.json();
  const users: User[] = responseJson.data;
  return users;
};
