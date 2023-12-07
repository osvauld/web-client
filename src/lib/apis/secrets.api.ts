import { baseUrl, token } from "./temp";
import { secretStore } from "../store/secret.store";
export const getSecretsByFolder = async (folderId: string) => {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  //   const response = await fetch(`${baseUrl}/secrets?folderId=${folderId}`, {
  //     headers,
  //   });
  //   const data = await response.json();
  const data = {
    success: true,
    message: "Fetched credentials",
    data: [
      {
        id: "2ae39a6e-29b3-4452-acc1-564ce99e62fa",
        name: "dinner",
        description: "Tv floor think responsibility.",
        unencryptedData: [
          {
            fieldName: "take",
            fieldValue: "financial",
          },
          {
            fieldName: "social",
            fieldValue: "send",
          },
          {
            fieldName: "he",
            fieldValue: "hand",
          },
          {
            fieldName: "art",
            fieldValue: "million",
          },
          {
            fieldName: "scientist",
            fieldValue: "consumer",
          },
        ],
      },
      {
        id: "8e7b2523-cab0-48e1-acc5-67ba59e9e1d1",
        name: "pass",
        description: "Finish event strategy name money president.",
        unencryptedData: [
          {
            fieldName: "child",
            fieldValue: "address",
          },
          {
            fieldName: "maybe",
            fieldValue: "move",
          },
          {
            fieldName: "drug",
            fieldValue: "truth",
          },
        ],
      },
      {
        id: "abf5e348-6339-47d9-93b5-c0c0e96a0691",
        name: "hit",
        description: "No establish air difficult yet.",
        unencryptedData: [
          {
            fieldName: "bad",
            fieldValue: "sign",
          },
          {
            fieldName: "perhaps",
            fieldValue: "situation",
          },
          {
            fieldName: "member",
            fieldValue: "keep",
          },
          {
            fieldName: "kind",
            fieldValue: "staff",
          },
        ],
      },
    ],
  };
  if (data.data) {
    secretStore.set(data.data);
  }
};
