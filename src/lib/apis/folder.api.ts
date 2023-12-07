import { baseUrl, token } from "./temp";
import { folderStore } from "../store/folder.store";

const fetchAllFolders = async () => {
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  //   console.log("test");
  const response = await fetch(`${baseUrl}/folders/`, options).then(
    (response) => response.json()
  );

  if (response.data) {
    folderStore.set(response.data);
  }
};

export { fetchAllFolders };
