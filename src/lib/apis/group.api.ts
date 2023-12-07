import { groupStore } from "../store/group.store";
import { baseUrl, token } from "./temp";

export const fetchAllUserGroups = async () => {
  //   const response = await fetch(`${baseUrl}/groups`, {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   });
  //   const data = await response.json();
  //   return data;
  const response = {
    success: true,
    message: "Fetched user groups",
    data: [
      {
        id: "663bb023-4bed-4c80-9737-1fca9550611e",
        created_at: "2023-12-07T18:44:49.447395+05:30",
        updated_at: "2023-12-07T18:44:49.447395+05:30",
        name: "one hunderd",
        created_by: "f4de13e2-db91-4b9c-a4ff-92574daf8884",
      },
      {
        id: "491231a1-6f98-467a-a5db-8ba738f11423",
        created_at: "2023-12-07T18:44:54.046524+05:30",
        updated_at: "2023-12-07T18:44:54.046524+05:30",
        name: "tow hundered",
        created_by: "f4de13e2-db91-4b9c-a4ff-92574daf8884",
      },
    ],
  };

  if (response.data) {
    groupStore.set(response.data);
  }
};
