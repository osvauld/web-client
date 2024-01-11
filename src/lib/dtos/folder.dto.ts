import { ShareCredentialsWithUsersPayload } from "./credential.dto";
export type Folder = {
  id: string;
  name: string;
  description: string;
};

export type ShareFolderWithUsersPayload = ShareCredentialsWithUsersPayload & {
  folderId: string;
};
