export type Folder = {
	id: string;
	name: string;
	description?: string;
	accessType: string;
};

export type Env = {
	id: string;
	name: string;
	publicKey: string;
	cliUser: string;
};
