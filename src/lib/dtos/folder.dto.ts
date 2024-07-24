type FolderType = "private" | "shared";
type FolderAccessType = "reader" | "manager";
export type Folder = {
	id: string;
	name: string;
	description?: string;
	accessType: FolderAccessType;
	type: FolderType;
};

export type Env = {
	id: string;
	name: string;
	publicKey: string;
	cliUser: string;
};
