import { baseUrl, token } from "./temp";
import { folderStore } from "../store/folder";

const fetchAllFolders = async () => {
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  //   console.log("test");
  //   return fetch(`${baseUrl}/folders`, options).then((response) =>
  //     response.json()
  //   );
  const response = {
    success: true,
    message: "Fetched folders",
    data: [
      {
        id: "5f9583f8-6926-4520-8287-3f35add58290",
        name: "animal day",
        description: "Threat result full enjoy task Mrs.",
      },
      {
        id: "74f99558-8963-4230-9cb3-06aaf70fa7cf",
        name: "material analysis",
        description: "Mouth next low feel dog.",
      },
      {
        id: "85179899-d4e4-49f4-9f1c-51a7f4b8056d",
        name: "race window",
        description: "Treat space recent face best south.",
      },
      {
        id: "745160ef-5c51-4e03-9a0d-b6c88a0dfa9d",
        name: "key particular",
        description: "Marriage six individual management where.",
      },
      {
        id: "1c2bb5a4-1c07-42b4-803c-f4ed6c2f8450",
        name: "section and",
        description: "Answer assume child under red value sure.",
      },
      {
        id: "b7ac0547-070f-43ed-a344-d2d1646a04b6",
        name: "notice general",
        description: "Suggest adult effort under doctor wide might really.",
      },
      {
        id: "3830dae6-891d-446a-b162-d9b91c03b522",
        name: "billion kind",
        description: "Game final color especially page result southern.",
      },
      {
        id: "01816eb2-2ab5-4ac7-abb7-4012adb60c95",
        name: "husband apply",
        description: "Including ago marriage give church be.",
      },
      {
        id: "040ecd81-4e1b-4514-87f6-49073432e295",
        name: "down us",
        description: "Score employee report anyone get key bag discussion.",
      },
    ],
  };
  if (response.data) {
    folderStore.set(response.data);
  }
};

export { fetchAllFolders };
